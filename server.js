// Import required dependencies
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Test database connection on startup
const testDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connection test successful:', result.rows[0].now);
    client.release();
  } catch (err) {
    console.error('❌ Database connection test failed:', err.message);
    console.error('Please check your DATABASE_URL in the .env file');
  }
};

// Routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SimuTrader backend is running',
    timestamp: new Date().toISOString()
  });
});

// API base route
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Welcome to SimuTrader API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      stocks: '/api/stocks',
      prices: '/api/prices'
    }
  });
});

// Mock market data with base prices
const marketData = {
  BTC: { symbol: 'BTC', name: 'Bitcoin', basePrice: 45000, lastPrice: 45000 },
  ETH: { symbol: 'ETH', name: 'Ethereum', basePrice: 2800, lastPrice: 2800 },
  AAPL: { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 178.50, lastPrice: 178.50 },
  TSLA: { symbol: 'TSLA', name: 'Tesla Inc.', basePrice: 245.60, lastPrice: 245.60 }
};

// Function to generate fluctuating price
function getFluctuatingPrice(symbol) {
  const asset = marketData[symbol];
  if (!asset) return null;
  
  // Generate random fluctuation between -0.5% and +0.5%
  const fluctuationPercent = (Math.random() - 0.5) * 1.0; // -0.5% to +0.5%
  const fluctuation = asset.basePrice * (fluctuationPercent / 100);
  
  // Update last price with fluctuation
  asset.lastPrice = asset.basePrice + fluctuation;
  
  // Calculate change from base price
  const change = asset.lastPrice - asset.basePrice;
  const changePercent = (change / asset.basePrice) * 100;
  
  return {
    symbol: asset.symbol,
    name: asset.name,
    price: parseFloat(asset.lastPrice.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    timestamp: new Date().toISOString()
  };
}

// Live market prices endpoint
app.get('/api/prices', (req, res) => {
  try {
    const prices = Object.keys(marketData).map(symbol => getFluctuatingPrice(symbol));
    
    res.status(200).json({
      success: true,
      count: prices.length,
      data: prices,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error generating prices:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prices',
      message: err.message
    });
  }
});

// Trade execution endpoint - POST /api/trade
app.post('/api/trade', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { asset, type, quantity, price } = req.body;
    
    // Validation
    if (!asset || !type || !quantity || !price) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Please provide asset, type, quantity, and price'
      });
    }
    
    if (type !== 'buy' && type !== 'sell') {
      return res.status(400).json({
        success: false,
        error: 'Invalid trade type',
        message: 'Type must be either "buy" or "sell"'
      });
    }
    
    if (quantity <= 0 || price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid values',
        message: 'Quantity and price must be positive numbers'
      });
    }
    
    // Start transaction
    await client.query('BEGIN');
    
    const userId = 1; // Default user ID for demo (in production, get from auth)
    const totalAmount = quantity * price;
    
    // Handle SELL - Check if user has enough quantity
    if (type === 'sell') {
      const portfolioCheck = await client.query(
        'SELECT quantity FROM portfolio WHERE user_id = $1 AND asset = $2',
        [userId, asset]
      );
      
      if (portfolioCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: 'Asset not found',
          message: `You don't own any ${asset}`
        });
      }
      
      const currentQuantity = portfolioCheck.rows[0].quantity;
      
      if (currentQuantity < quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: 'Insufficient quantity',
          message: `You only have ${currentQuantity} ${asset}. Cannot sell ${quantity}.`
        });
      }
      
      // Update portfolio - decrease quantity
      const newQuantity = currentQuantity - quantity;
      
      if (newQuantity === 0) {
        // Remove from portfolio if quantity becomes 0
        await client.query(
          'DELETE FROM portfolio WHERE user_id = $1 AND asset = $2',
          [userId, asset]
        );
      } else {
        // Update quantity
        await client.query(
          'UPDATE portfolio SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND asset = $3',
          [newQuantity, userId, asset]
        );
      }
    }
    
    // Handle BUY - Add or update portfolio
    if (type === 'buy') {
      const portfolioCheck = await client.query(
        'SELECT quantity, avg_price FROM portfolio WHERE user_id = $1 AND asset = $2',
        [userId, asset]
      );
      
      if (portfolioCheck.rows.length === 0) {
        // Insert new asset into portfolio
        await client.query(
          `INSERT INTO portfolio (user_id, asset, quantity, avg_price, created_at, updated_at)
           VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [userId, asset, quantity, price]
        );
      } else {
        // Update existing asset - calculate new average price
        const currentQuantity = portfolioCheck.rows[0].quantity;
        const currentAvgPrice = portfolioCheck.rows[0].avg_price;
        
        const totalCost = (currentQuantity * currentAvgPrice) + (quantity * price);
        const newQuantity = currentQuantity + quantity;
        const newAvgPrice = totalCost / newQuantity;
        
        await client.query(
          'UPDATE portfolio SET quantity = $1, avg_price = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3 AND asset = $4',
          [newQuantity, newAvgPrice, userId, asset]
        );
      }
    }
    
    // Insert transaction record
    const transactionResult = await client.query(
      `INSERT INTO transactions (user_id, asset, type, quantity, price, total_amount, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       RETURNING id, created_at`,
      [userId, asset, type, quantity, price, totalAmount]
    );
    
    // Commit transaction
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      message: `Successfully ${type === 'buy' ? 'bought' : 'sold'} ${quantity} ${asset}`,
      data: {
        transactionId: transactionResult.rows[0].id,
        asset: asset,
        type: type,
        quantity: quantity,
        price: price,
        totalAmount: totalAmount,
        timestamp: transactionResult.rows[0].created_at
      }
    });
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error executing trade:', err.message);
    res.status(500).json({
      success: false,
      error: 'Trade execution failed',
      message: err.message
    });
  } finally {
    client.release();
  }
});

// Example stocks endpoint - GET all stocks
app.get('/api/stocks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM stocks ORDER BY symbol ASC');
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error('Error fetching stocks:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stocks',
      message: err.message
    });
  }

// ===================================
// IBM watsonx.ai Integration
// ===================================

// Cache for IAM access token
let iamTokenCache = {
  token: null,
  expiresAt: 0
};

/**
 * Exchange watsonx API key for IBM Cloud IAM access token
 * Tokens are cached and reused until they expire
 */
async function getIAMAccessToken() {
  // Check if we have a valid cached token
  const now = Date.now();
  if (iamTokenCache.token && iamTokenCache.expiresAt > now) {
    console.log('✅ Using cached IAM token');
    return iamTokenCache.token;
  }

  const apiKey = process.env.WATSONX_API_KEY;
  
  if (!apiKey) {
    throw new Error('WATSONX_API_KEY not configured in environment variables');
  }

  try {
    console.log('🔄 Requesting new IAM access token...');
    
    const response = await fetch('https://iam.cloud.ibm.com/identity/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
        apikey: apiKey
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`IAM token request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Cache the token (expires_in is in seconds, convert to milliseconds)
    // Refresh 5 minutes before actual expiry for safety
    const expiresIn = (data.expires_in - 300) * 1000;
    iamTokenCache = {
      token: data.access_token,
      expiresAt: now + expiresIn
    };

    console.log('✅ IAM access token obtained and cached');
    return data.access_token;
    
  } catch (error) {
    console.error('❌ Error getting IAM token:', error.message);
    throw error;
  }
}

/**
 * Call IBM watsonx.ai granite-3-8b-instruct model
 */
async function callWatsonxAI(userPrompt) {
  const projectId = process.env.WATSONX_PROJECT_ID;
  
  if (!projectId) {
    throw new Error('WATSONX_PROJECT_ID not configured in environment variables');
  }

  // Get IAM access token
  const accessToken = await getIAMAccessToken();

  // System prompt for SimuTrader assistant
  const systemPrompt = `You are a helpful AI financial assistant for SimuTrader, a stock trading simulator platform. 
Your role is to:
- Provide clear, accurate information about stocks, trading, and financial markets
- Help users understand trading concepts and strategies
- Analyze market trends and provide insights
- Answer questions about portfolio management
- Explain financial terminology in simple terms
- Always remind users that SimuTrader is a simulator for learning purposes

Keep responses concise, professional, and educational. Do not provide actual financial advice or recommend specific investments.`;

  const payload = {
    model_id: 'ibm/granite-3-8b-instruct',
    input: `${systemPrompt}\n\nUser: ${userPrompt}\n\nAssistant:`,
    parameters: {
      max_new_tokens: 500,
      temperature: 0.7,
      top_p: 0.9,
      top_k: 50,
      repetition_penalty: 1.1
    },
    project_id: projectId
  };

  try {
    console.log('🤖 Calling watsonx.ai granite-3-8b-instruct...');
    
    const response = await fetch('https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`watsonx.ai API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ watsonx.ai response received');
    
    return data.results[0].generated_text.trim();
    
  } catch (error) {
    console.error('❌ Error calling watsonx.ai:', error.message);
    throw error;
  }
}

// POST /api/watsonx/chat - AI Financial Assistant endpoint
app.post('/api/watsonx/chat', async (req, res) => {
  try {
    const { prompt } = req.body;

    // Validation
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid prompt',
        message: 'Please provide a valid prompt string'
      });
    }

    if (prompt.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Prompt too long',
        message: 'Prompt must be less than 2000 characters'
      });
    }

    // Call watsonx.ai
    const generatedText = await callWatsonxAI(prompt);

    res.status(200).json({
      success: true,
      data: {
        prompt: prompt,
        response: generatedText,
        model: 'ibm/granite-3-8b-instruct',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in watsonx chat endpoint:', error.message);
    
    // Check if it's a configuration error
    if (error.message.includes('not configured')) {
      return res.status(500).json({
        success: false,
        error: 'Configuration error',
        message: 'watsonx.ai credentials not properly configured. Please check your environment variables.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'AI assistant error',
      message: 'Failed to get response from AI assistant. Please try again.'
    });
  }
});

});

// Example stocks endpoint - GET single stock by symbol
app.get('/api/stocks/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const result = await pool.query(
      'SELECT * FROM stocks WHERE symbol = $1',
      [symbol.toUpperCase()]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Stock not found',
        message: `No stock found with symbol: ${symbol}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error fetching stock:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock',
      message: err.message
    });
  }
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// Start server
const server = app.listen(PORT, async () => {
  console.log(`🚀 SimuTrader backend server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 API base: http://localhost:${PORT}/api`);
  await testDatabaseConnection();
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(async () => {
    console.log('✅ HTTP server closed');
    
    try {
      await pool.end();
      console.log('✅ Database pool closed');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error during shutdown:', err);
      process.exit(1);
    }
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⚠️ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

module.exports = app;

// Made with Bob
