# 📈 SimuTrader - Stock Trading Simulator

> **Developed with IBM Bob** - An AI-powered full-stack stock trading simulator with real-time market data, portfolio management, and an intelligent financial assistant powered by IBM watsonx.ai.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![PostgreSQL](https://img.shields.io/badge/postgresql-%3E%3D12.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)

## 🤖 Built with IBM Bob

This entire project was developed in collaboration with **IBM Bob**, an advanced AI development partner. IBM Bob assisted in:

- 🏗️ **Architecture Design** - Full-stack application structure
- 💻 **Backend Development** - Node.js/Express API with PostgreSQL
- 🎨 **Frontend Design** - Minimalist dark-theme UI/UX
- 🤖 **AI Integration** - IBM watsonx.ai granite-3-8b-instruct model
- 📊 **Database Schema** - Optimized PostgreSQL tables
- 🔒 **Security Implementation** - IAM token management
- 📝 **Documentation** - Comprehensive guides and examples

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [Frontend Features](#-frontend-features)
- [AI Financial Assistant](#-ai-financial-assistant)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎯 Core Features
- **Real-time Market Data** - Live price updates every 5 seconds with realistic fluctuations
- **Portfolio Management** - Track holdings, calculate P/L, manage positions
- **Trade Execution** - Buy/sell stocks with market orders
- **Transaction History** - Complete audit trail of all trades
- **AI Financial Assistant** - Powered by IBM watsonx.ai granite-3-8b-instruct

### 📊 Dashboard Features
- Interactive portfolio performance chart (Chart.js)
- Real-time statistics cards (portfolio value, cash balance, P/L)
- Current holdings table with live prices
- Market movers widget with top gainers/losers
- Trade simulator panel with order management

### 🤖 AI Assistant Features
- Natural language financial Q&A
- Trading concept explanations
- Market trend analysis
- Portfolio management advice
- Educational financial guidance

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js (v14+)
- **Framework**: Express.js (v4.19.2)
- **Database**: PostgreSQL (v12+)
- **Database Client**: node-postgres (pg v8.12.0)
- **AI Platform**: IBM watsonx.ai (granite-3-8b-instruct)
- **Authentication**: IBM Cloud IAM

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom dark theme with CSS variables
- **Vanilla JavaScript** - No frameworks, pure ES6+
- **Chart.js** (v4.4.0) - Portfolio visualization
- **Fetch API** - RESTful API communication

### Development Tools
- **dotenv** (v16.4.5) - Environment variable management
- **CORS** (v2.8.5) - Cross-origin resource sharing
- **IBM Bob** - AI development partner

---

## 📁 Project Structure

```
SimuTrader/
├── 📄 server.js              # Express server & API routes
├── 📄 app.js                 # Frontend JavaScript logic
├── 📄 index.html             # Main dashboard UI
├── 📄 styles.css             # Dark theme styling
├── 📄 schema.sql             # Database schema & sample data
├── 📄 test-integration.html  # API testing interface
├── 📄 package.json           # Node.js dependencies
├── 📄 .env.example           # Environment variables template
├── 📄 .gitignore             # Git ignore rules
└── 📄 README.md              # This file

Backend Structure (server.js):
├── 🔧 Configuration & Middleware
├── 🗄️ PostgreSQL Connection Pool
├── 🤖 IBM watsonx.ai Integration
│   ├── IAM Token Exchange
│   └── Granite-3-8b-instruct Model
├── 🌐 API Routes
│   ├── /health              # Health check
│   ├── /api                 # API info
│   ├── /api/prices          # Live market prices
│   ├── /api/trade           # Trade execution
│   ├── /api/stocks          # Stock data
│   └── /api/watsonx/chat    # AI assistant
└── 🚀 Server Startup & Error Handling

Frontend Structure:
├── 🎨 UI Components
│   ├── Sidebar Navigation
│   ├── Header & Search
│   ├── Stats Cards
│   ├── Portfolio Chart
│   ├── Trade Simulator Panel
│   ├── Holdings Table
│   ├── Market Movers
│   └── AI Chat Window
└── 💻 JavaScript Modules
    ├── Navigation
    ├── Trade Panel
    ├── Chart Initialization
    ├── Live Price Updates
    ├── Trade Execution
    └── AI Chat Integration
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12.0 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** (comes with Node.js)
- **IBM Cloud Account** - For watsonx.ai access
- **watsonx.ai API Key** - [Get API Key](https://cloud.ibm.com/catalog/services/watsonx-ai)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SimuTrader
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web framework
- `pg` - PostgreSQL client
- `cors` - CORS middleware
- `dotenv` - Environment variables

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials (see [Environment Variables](#-environment-variables) section).

### 4. Set Up Database

```bash
# Create database
createdb simutrader

# Run schema
psql -d simutrader -f schema.sql
```

### 5. Start the Server

```bash
npm start
```

Server will start on `http://localhost:3000`

### 6. Open Frontend

```bash
# Option A: Direct file
open index.html

# Option B: Local server (recommended)
npx http-server -p 8080
# Then open http://localhost:8080
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/simutrader

# IBM watsonx.ai Configuration
WATSONX_API_KEY=your_watsonx_api_key_here
WATSONX_PROJECT_ID=your_project_id_here

# Optional
NODE_ENV=development
```

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port number | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/simutrader` |
| `WATSONX_API_KEY` | IBM watsonx.ai API key | your_api_key |
| `WATSONX_PROJECT_ID` | watsonx.ai project ID | your_project_id |

### Getting watsonx.ai Credentials

1. Go to [IBM Cloud](https://cloud.ibm.com/)
2. Create a watsonx.ai service instance
3. Create a project
4. Generate an API key
5. Copy your Project ID from project settings

---

## 🗄️ Database Setup

### Schema Overview

The database consists of 4 main tables:

1. **users** - User accounts and balances
2. **portfolio** - User holdings and positions
3. **transactions** - Trade history and audit trail
4. **stocks** - Reference stock data

### Quick Setup

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE simutrader;

# Exit and run schema
\q
psql -U postgres -d simutrader -f schema.sql
```

### Manual Setup

```sql
-- Create tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 100000.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE portfolio (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset VARCHAR(10) NOT NULL,
    quantity DECIMAL(15, 8) NOT NULL,
    avg_price DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, asset)
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset VARCHAR(10) NOT NULL,
    type VARCHAR(4) NOT NULL CHECK (type IN ('buy', 'sell')),
    quantity DECIMAL(15, 8) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stocks (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    change DECIMAL(10, 2) DEFAULT 0,
    change_percent DECIMAL(5, 2) DEFAULT 0,
    volume BIGINT DEFAULT 0,
    market_cap BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo user
INSERT INTO users (username, email, password_hash, balance)
VALUES ('demo', 'demo@simutrader.com', 'demo_hash', 100000.00);
```

---

## 🏃 Running the Application

### Development Mode

```bash
# Terminal 1: Start backend
npm start

# Terminal 2: Serve frontend (optional)
npx http-server -p 8080
```

### Production Mode

```bash
# Set environment
export NODE_ENV=production

# Start server
npm start
```

### Using PM2 (Production)

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start server.js --name simutrader

# Monitor
pm2 monit

# Logs
pm2 logs simutrader
```

---

## 🌐 API Endpoints

### Base URL
```
http://localhost:3000
```

### Health & Info

#### GET `/health`
Check server status

**Response:**
```json
{
  "status": "OK",
  "message": "SimuTrader backend is running",
  "timestamp": "2026-05-17T10:00:00.000Z"
}
```

#### GET `/api`
Get API information

**Response:**
```json
{
  "message": "Welcome to SimuTrader API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "stocks": "/api/stocks",
    "prices": "/api/prices"
  }
}
```

---

### Market Data

#### GET `/api/prices`
Get live market prices with fluctuations

**Response:**
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "price": 45123.45,
      "change": 123.45,
      "changePercent": 0.27,
      "timestamp": "2026-05-17T10:00:00.000Z"
    },
    {
      "symbol": "ETH",
      "name": "Ethereum",
      "price": 2789.32,
      "change": -10.68,
      "changePercent": -0.38,
      "timestamp": "2026-05-17T10:00:00.000Z"
    }
  ],
  "timestamp": "2026-05-17T10:00:00.000Z"
}
```

**Features:**
- Returns BTC, ETH, AAPL, TSLA prices
- Prices fluctuate ±0.5% on each call
- Simulates live market movement

---

#### GET `/api/stocks`
Get all stocks from database

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "price": "178.50",
      "change": "2.30",
      "change_percent": "1.31",
      "volume": "52000000",
      "market_cap": "2800000000000"
    }
  ]
}
```

---

#### GET `/api/stocks/:symbol`
Get specific stock by symbol

**Parameters:**
- `symbol` (string) - Stock symbol (e.g., AAPL)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "price": "178.50",
    "change": "2.30",
    "change_percent": "1.31"
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "error": "Stock not found",
  "message": "No stock found with symbol: XYZ"
}
```

---

### Trading

#### POST `/api/trade`
Execute a buy or sell trade

**Request Body:**
```json
{
  "asset": "AAPL",
  "type": "buy",
  "quantity": 10,
  "price": 178.50
}
```

**Parameters:**
- `asset` (string, required) - Stock symbol
- `type` (string, required) - "buy" or "sell"
- `quantity` (number, required) - Number of shares
- `price` (number, required) - Price per share

**Success Response (201):**
```json
{
  "success": true,
  "message": "Successfully bought 10 AAPL",
  "data": {
    "transactionId": 123,
    "asset": "AAPL",
    "type": "buy",
    "quantity": 10,
    "price": 178.50,
    "totalAmount": 1785.00,
    "timestamp": "2026-05-17T10:00:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Insufficient quantity",
  "message": "You only have 5 AAPL. Cannot sell 10."
}
```

**Features:**
- Validates user has sufficient quantity for sells
- Updates portfolio automatically
- Calculates weighted average cost basis
- Records transaction in database
- Uses PostgreSQL transactions for atomicity

---

### AI Assistant

#### POST `/api/watsonx/chat`
Chat with AI Financial Assistant

**Request Body:**
```json
{
  "prompt": "What is a limit order and when should I use it?"
}
```

**Parameters:**
- `prompt` (string, required) - User question (max 2000 chars)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "prompt": "What is a limit order...",
    "response": "A limit order is a type of order to buy or sell a stock at a specific price or better. Unlike market orders that execute immediately at the current market price, limit orders give you control over the execution price...",
    "model": "ibm/granite-3-8b-instruct",
    "timestamp": "2026-05-17T10:00:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid prompt",
  "message": "Please provide a valid prompt string"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "error": "Configuration error",
  "message": "watsonx.ai credentials not properly configured"
}
```

**Features:**
- Powered by IBM watsonx.ai granite-3-8b-instruct
- Automatic IAM token management
- Token caching for performance
- Context-aware financial assistant
- Educational and professional responses

---

## 🎨 Frontend Features

### Dashboard Components

1. **Sidebar Navigation**
   - Dashboard, Portfolio, Trade, Markets, History
   - Active state highlighting
   - User info with balance

2. **Header**
   - Page title and subtitle
   - Search box for stocks
   - Notification and settings buttons

3. **Stats Cards**
   - Portfolio Value
   - Cash Balance
   - Today's P/L
   - Total Trades

4. **Portfolio Chart**
   - Interactive Chart.js visualization
   - Timeframe selection (1D, 1W, 1M, 3M, 1Y, ALL)
   - Hover tooltips with values

5. **Trade Simulator Panel**
   - Buy/Sell toggle
   - Stock symbol input with auto-lookup
   - Order type selection (Market, Limit, Stop)
   - Quantity input
   - Real-time trade summary
   - Execute trade button

6. **Holdings Table**
   - Current positions
   - Shares, average cost, current price
   - P/L calculation with color coding
   - Quick trade actions

7. **Market Movers**
   - Top gainers/losers
   - Live price updates
   - Percentage changes

8. **AI Chat Window**
   - Floating chat interface
   - Real-time AI responses
   - Typing indicators
   - Message history
   - Mobile responsive

### Live Features

- **Auto Price Updates**: Fetches prices every 5 seconds
- **Real-time Trade Execution**: Instant feedback
- **AI Chat**: Natural language Q&A
- **Responsive Design**: Works on all devices
- **Dark Theme**: Easy on the eyes

---

## 🤖 AI Financial Assistant

### Powered by IBM watsonx.ai

The AI assistant uses the **granite-3-8b-instruct** model from IBM watsonx.ai, providing:

- **Financial Knowledge**: Stocks, bonds, trading concepts
- **Market Analysis**: Trends, patterns, insights
- **Portfolio Advice**: Diversification, risk management
- **Educational Content**: Terminology, strategies
- **Contextual Responses**: Tailored to SimuTrader

### System Prompt

```
You are a helpful AI financial assistant for SimuTrader, 
a stock trading simulator platform. Your role is to:
- Provide clear, accurate information about stocks and trading
- Help users understand trading concepts and strategies
- Analyze market trends and provide insights
- Answer questions about portfolio management
- Explain financial terminology in simple terms
- Always remind users that SimuTrader is a simulator
```

### Example Interactions

**Q:** "What is diversification?"
**A:** "Diversification is a risk management strategy that involves spreading investments across different assets, sectors, or markets to reduce exposure to any single investment..."

**Q:** "Should I buy AAPL stock?"
**A:** "As a SimuTrader assistant, I can't recommend specific investments. However, I can help you understand factors to consider when evaluating any stock..."

### Technical Details

- **Model**: ibm/granite-3-8b-instruct
- **Max Tokens**: 500
- **Temperature**: 0.7
- **Authentication**: IBM Cloud IAM
- **Token Caching**: Automatic refresh
- **Error Handling**: Graceful fallbacks

---

## 🧪 Testing

### Using test-integration.html

Open `test-integration.html` in a browser for a comprehensive testing interface:

1. **Server Health Check**
   - Verify backend is running
   - Check connection status

2. **Live Prices**
   - Fetch current prices
   - Start/stop auto-updates
   - View JSON responses

3. **Trade Execution**
   - Custom trade form
   - Quick buy/sell buttons
   - Response validation

4. **Stocks Endpoint**
   - Fetch all stocks
   - Query specific symbols
   - View database data

5. **Console Log**
   - Real-time activity log
   - Error tracking
   - API call history

### Manual Testing

```bash
# Health check
curl http://localhost:3000/health

# Get prices
curl http://localhost:3000/api/prices

# Execute trade
curl -X POST http://localhost:3000/api/trade \
  -H "Content-Type: application/json" \
  -d '{"asset":"AAPL","type":"buy","quantity":10,"price":178.50}'

# AI chat
curl -X POST http://localhost:3000/api/watsonx/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What is a bull market?"}'
```

---

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Failed

**Problem:** `Database connection test failed`

**Solutions:**
1. Verify PostgreSQL is running:
   ```bash
   # Windows
   pg_ctl status
   
   # Linux/Mac
   sudo systemctl status postgresql
   ```

2. Check DATABASE_URL in `.env`
3. Ensure database exists:
   ```sql
   \l  -- List databases in psql
   ```

4. Verify credentials and permissions

---

#### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions:**
1. Change PORT in `.env`
2. Kill process using port 3000:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # Linux/Mac
   lsof -ti:3000 | xargs kill -9
   ```

---

#### watsonx.ai Configuration Error

**Problem:** `watsonx.ai credentials not properly configured`

**Solutions:**
1. Verify WATSONX_API_KEY in `.env`
2. Verify WATSONX_PROJECT_ID in `.env`
3. Check API key is valid
4. Ensure project exists in IBM Cloud
5. Verify IAM token exchange is working

---

#### CORS Errors

**Problem:** `Access-Control-Allow-Origin` errors

**Solutions:**
1. Ensure CORS middleware is enabled in server.js
2. Check API_BASE_URL in app.js matches server
3. Use local server instead of file:// protocol:
   ```bash
   npx http-server -p 8080
   ```

---

#### Module Not Found

**Problem:** `Error: Cannot find module 'express'`

**Solutions:**
1. Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Verify package.json exists
3. Check Node.js version (v14+)

---

## 🤝 Contributing

Contributions are welcome! This project was built with IBM Bob, and we encourage collaborative development.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style

- Use ES6+ JavaScript
- Follow existing naming conventions
- Comment complex logic
- Update documentation

---

## 📄 License

This project is licensed under the ISC License.

---

## 🙏 Acknowledgments

### Special Thanks to IBM Bob

This project was entirely developed in partnership with **IBM Bob**, an advanced AI development assistant. IBM Bob provided:

- ✅ Complete architecture design
- ✅ Full-stack implementation
- ✅ Database schema optimization
- ✅ AI integration expertise
- ✅ Security best practices
- ✅ Comprehensive documentation
- ✅ Testing strategies
- ✅ Troubleshooting guides

### Technologies

- **IBM watsonx.ai** - AI-powered financial assistant
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Chart.js** - Data visualization

---

## 📞 Support

For issues, questions, or contributions:

- 📧 Email: support@simutrader.com
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

---

## 🚀 Future Enhancements

- [ ] User authentication and authorization
- [ ] Real-time WebSocket price updates
- [ ] Advanced charting with technical indicators
- [ ] Portfolio analytics and insights
- [ ] Social trading features
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Advanced order types (stop-loss, trailing stop)
- [ ] Backtesting capabilities
- [ ] API rate limiting
- [ ] Redis caching
- [ ] Docker containerization
- [ ] CI/CD pipeline

---

<div align="center">

**Built with ❤️ and IBM Bob**
Team[Oggy&Bob]:-

Ajit Sharma.
Ram Gangul.
Atharva Sheshgiri.

[⬆ Back to Top](#-simutrader---stock-trading-simulator)

</div>
