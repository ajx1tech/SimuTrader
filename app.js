// ===================================
// SimuTrader - Frontend Application
// ===================================

// API Configuration
const API_BASE_URL = 'https://simutrader-backend.onrender.com';
let priceUpdateInterval = null;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 SimuTrader UI initialized');
    
    // Initialize all UI components
    initNavigation();
    initTradePanel();
    initChart();
    initSearchBox();
    initOrderTypeToggle();
    
    // Start fetching live prices
    fetchLivePrices();
    startPriceUpdates();
});

// ===================================
// Live Price Updates
// ===================================

async function fetchLivePrices() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/prices`);
        const result = await response.json();
        
        if (result.success) {
            updatePricesInUI(result.data);
            console.log('📊 Prices updated:', result.data.length, 'assets');
        }
    } catch (error) {
        console.error('❌ Error fetching prices:', error);
        showNotification('Failed to fetch live prices', 'error');
    }
}

function startPriceUpdates() {
    // Fetch prices every 5 seconds
    priceUpdateInterval = setInterval(fetchLivePrices, 5000);
    console.log('⏰ Started live price updates (every 5 seconds)');
}

function stopPriceUpdates() {
    if (priceUpdateInterval) {
        clearInterval(priceUpdateInterval);
        console.log('⏸️ Stopped live price updates');
    }
}

function updatePricesInUI(prices) {
    // Update market movers section
    const moversList = document.querySelector('.movers-list');
    if (moversList) {
        moversList.innerHTML = prices.map(asset => `
            <div class="mover-item">
                <div class="mover-info">
                    <span class="symbol">${asset.symbol}</span>
                    <span class="name">${asset.name}</span>
                </div>
                <div class="mover-price">
                    <span class="price">$${asset.price.toFixed(2)}</span>
                    <span class="change ${asset.changePercent >= 0 ? 'positive' : 'negative'}">
                        ${asset.changePercent >= 0 ? '+' : ''}${asset.changePercent.toFixed(2)}%
                    </span>
                </div>
            </div>
        `).join('');
    }
    
    // Update stock info in trade panel if a symbol is selected
    const stockSymbolInput = document.getElementById('stock-symbol');
    if (stockSymbolInput && stockSymbolInput.value) {
        const symbol = stockSymbolInput.value.toUpperCase();
        const asset = prices.find(p => p.symbol === symbol);
        
        if (asset) {
            const stockInfo = document.querySelector('.stock-info');
            if (stockInfo) {
                stockInfo.innerHTML = `
                    <span class="stock-name">${asset.name}</span>
                    <span class="stock-price">$${asset.price.toFixed(2)}</span>
                `;
            }
            
            // Update trade summary with current price
            updateTradeSummary(asset.price);
        }
    }
}

// ===================================
// Navigation
// ===================================

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get page name
            const page = this.dataset.page;
            console.log(`📄 Navigating to: ${page}`);
            
            // Update page title
            updatePageTitle(page);
        });
    });
}

function updatePageTitle(page) {
    const pageTitle = document.querySelector('.page-title');
    const pageSubtitle = document.querySelector('.page-subtitle');
    
    const titles = {
        dashboard: {
            title: 'Dashboard',
            subtitle: 'Welcome back to your trading dashboard'
        },
        portfolio: {
            title: 'Portfolio',
            subtitle: 'View and manage your investments'
        },
        trade: {
            title: 'Trade',
            subtitle: 'Execute buy and sell orders'
        },
        markets: {
            title: 'Markets',
            subtitle: 'Explore market trends and opportunities'
        },
        history: {
            title: 'History',
            subtitle: 'Review your trading history'
        }
    };
    
    if (titles[page]) {
        pageTitle.textContent = titles[page].title;
        pageSubtitle.textContent = titles[page].subtitle;
    }
}

// ===================================
// Trade Panel
// ===================================

function initTradePanel() {
    const buyBtn = document.querySelector('[data-type="buy"]');
    const sellBtn = document.querySelector('[data-type="sell"]');
    const tradeForm = document.querySelector('.trade-form');
    const submitBtn = document.querySelector('.btn-primary');
    
    // Toggle between Buy and Sell
    buyBtn.addEventListener('click', function() {
        buyBtn.classList.add('active');
        sellBtn.classList.remove('active');
        submitBtn.classList.remove('btn-sell');
        submitBtn.classList.add('btn-buy');
        submitBtn.innerHTML = '<span>🛒</span> Place Buy Order';
        submitBtn.style.backgroundColor = 'var(--accent-success)';
        console.log('💰 Switched to BUY mode');
    });
    
    sellBtn.addEventListener('click', function() {
        sellBtn.classList.add('active');
        buyBtn.classList.remove('active');
        submitBtn.classList.remove('btn-buy');
        submitBtn.classList.add('btn-sell');
        submitBtn.innerHTML = '<span>💸</span> Place Sell Order';
        submitBtn.style.backgroundColor = 'var(--accent-danger)';
        console.log('💸 Switched to SELL mode');
    });
    
    // Form submission - Execute trade via API
    tradeForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const symbol = document.getElementById('stock-symbol').value.toUpperCase();
        const orderType = document.getElementById('order-type').value;
        const quantity = parseFloat(document.getElementById('quantity').value);
        const tradeType = buyBtn.classList.contains('active') ? 'buy' : 'sell';
        
        // Validation
        if (!symbol) {
            showNotification('Please enter a stock symbol', 'error');
            return;
        }
        
        if (!quantity || quantity <= 0) {
            showNotification('Please enter a valid quantity', 'error');
            return;
        }
        
        // Get current price from the stock info display
        const stockPriceElement = document.querySelector('.stock-price');
        let price = 0;
        
        if (stockPriceElement) {
            price = parseFloat(stockPriceElement.textContent.replace('$', ''));
        }
        
        if (!price || price <= 0) {
            showNotification('Unable to get current price. Please try again.', 'error');
            return;
        }
        
        // Disable submit button during request
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/trade`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    asset: symbol,
                    type: tradeType,
                    quantity: quantity,
                    price: price
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification(result.message, 'success');
                console.log('✅ Trade executed:', result.data);
                
                // Reset form
                tradeForm.reset();
                document.querySelector('.stock-info').innerHTML = `
                    <span class="stock-name">Select a symbol</span>
                    <span class="stock-price">$0.00</span>
                `;
                
                // Refresh portfolio (in a real app, you'd fetch updated portfolio data)
                setTimeout(() => {
                    showNotification('Portfolio updated!', 'info');
                }, 1000);
            } else {
                showNotification(result.message || result.error, 'error');
                console.error('❌ Trade failed:', result);
            }
        } catch (error) {
            console.error('❌ Error executing trade:', error);
            showNotification('Failed to execute trade. Please try again.', 'error');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            const icon = tradeType === 'buy' ? '🛒' : '💸';
            const action = tradeType === 'buy' ? 'Buy' : 'Sell';
            submitBtn.innerHTML = `<span>${icon}</span> Place ${action} Order`;
        }
    });
    
    // Update trade summary when quantity changes
    const quantityInput = document.getElementById('quantity');
    quantityInput.addEventListener('input', () => updateTradeSummary());
    
    // Update price when stock symbol changes
    const stockSymbolInput = document.getElementById('stock-symbol');
    stockSymbolInput.addEventListener('input', async function() {
        const symbol = this.value.toUpperCase();
        
        if (symbol.length >= 2) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/prices`);
                const result = await response.json();
                
                if (result.success) {
                    const asset = result.data.find(p => p.symbol === symbol);
                    
                    if (asset) {
                        const stockInfo = document.querySelector('.stock-info');
                        stockInfo.innerHTML = `
                            <span class="stock-name">${asset.name}</span>
                            <span class="stock-price">$${asset.price.toFixed(2)}</span>
                        `;
                        updateTradeSummary(asset.price);
                    }
                }
            } catch (error) {
                console.error('Error fetching asset price:', error);
            }
        }
    });
}

function updateTradeSummary(pricePerShare = null) {
    const quantity = document.getElementById('quantity').value || 0;
    
    // Get price from stock info display if not provided
    if (!pricePerShare) {
        const stockPriceElement = document.querySelector('.stock-price');
        if (stockPriceElement) {
            pricePerShare = parseFloat(stockPriceElement.textContent.replace('$', ''));
        } else {
            pricePerShare = 0;
        }
    }
    
    const commission = 0.00;
    
    const estimatedCost = (quantity * pricePerShare).toFixed(2);
    const total = (parseFloat(estimatedCost) + commission).toFixed(2);
    
    const summaryValues = document.querySelectorAll('.summary-value');
    if (summaryValues.length >= 3) {
        summaryValues[0].textContent = `$${estimatedCost}`;
        summaryValues[1].textContent = `$${commission.toFixed(2)}`;
        summaryValues[2].textContent = `$${total}`;
    }
}

// ===================================
// Order Type Toggle
// ===================================

function initOrderTypeToggle() {
    const orderTypeSelect = document.getElementById('order-type');
    const limitPriceGroup = document.querySelector('.limit-price-group');
    
    orderTypeSelect.addEventListener('change', function() {
        if (this.value === 'limit' || this.value === 'stop') {
            limitPriceGroup.style.display = 'flex';
            console.log(`📊 ${this.value.toUpperCase()} order selected - price input shown`);
        } else {
            limitPriceGroup.style.display = 'none';
            console.log('📊 MARKET order selected - price input hidden');
        }
    });
}

// ===================================
// Chart Initialization
// ===================================

function initChart() {
    const ctx = document.getElementById('portfolioChart');
    
    if (!ctx) {
        console.error('❌ Chart canvas not found');
        return;
    }
    
    // Mock data for portfolio performance
    const labels = generateTimeLabels(30);
    const data = generateMockPortfolioData(30, 100000, 125450);
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Portfolio Value',
                data: data,
                borderColor: '#4c6ef5',
                backgroundColor: 'rgba(76, 110, 245, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#4c6ef5',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: '#1e2738',
                    titleColor: '#e9ecef',
                    bodyColor: '#adb5bd',
                    borderColor: '#2d3748',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return '$' + context.parsed.y.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#6c757d',
                        maxTicksLimit: 8
                    }
                },
                y: {
                    grid: {
                        color: '#2d3748',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#6c757d',
                        callback: function(value) {
                            return '$' + (value / 1000).toFixed(0) + 'K';
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
    
    console.log('📊 Portfolio chart initialized');
    
    // Time range buttons
    const timeButtons = document.querySelectorAll('.btn-small');
    timeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            timeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            console.log(`📅 Chart timeframe changed to: ${this.textContent}`);
            // In a real app, this would update the chart data
        });
    });
}

// ===================================
// Search Box
// ===================================

function initSearchBox() {
    const searchInput = document.querySelector('.search-input');
    
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value;
        if (query.length > 0) {
            console.log(`🔍 Searching for: ${query}`);
            // In a real app, this would trigger an API call
        }
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            console.log(`🔍 Search submitted: ${this.value}`);
            showNotification(`Searching for "${this.value}"...`, 'info');
        }
    });
}

// ===================================
// Holdings Table Interactions
// ===================================

// Add click handlers to trade buttons in holdings table
document.querySelectorAll('.btn-action').forEach(btn => {
    btn.addEventListener('click', function() {
        const row = this.closest('tr');
        const symbol = row.querySelector('.symbol').textContent;
        console.log(`💱 Trade button clicked for: ${symbol}`);
        showNotification(`Opening trade panel for ${symbol}`, 'info');
        
        // Populate trade form with selected stock
        document.getElementById('stock-symbol').value = symbol;
        
        // Scroll to trade panel
        document.querySelector('.trade-panel').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    });
});

// ===================================
// Market Movers Tabs
// ===================================

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        console.log(`📊 Switched to: ${this.textContent}`);
        // In a real app, this would load different data
    });
});

// ===================================
// Utility Functions
// ===================================

function generateTimeLabels(days) {
    const labels = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    
    return labels;
}

function generateMockPortfolioData(days, startValue, endValue) {
    const data = [];
    const increment = (endValue - startValue) / days;
    
    for (let i = 0; i < days; i++) {
        // Add some randomness to make it look realistic
        const randomVariation = (Math.random() - 0.5) * 2000;
        const value = startValue + (increment * i) + randomVariation;
        data.push(value);
    }
    
    return data;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Style based on type
    const colors = {
        info: '#4c6ef5',
        success: '#51cf66',
        error: '#ff6b6b',
        warning: '#ffd43b'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${colors[type] || colors.info};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        font-size: 0.875rem;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===================================
// Console Welcome Message
// ===================================

console.log('%c🚀 SimuTrader UI Shell', 'color: #4c6ef5; font-size: 20px; font-weight: bold;');
console.log('%cUI components initialized - No business logic implemented yet', 'color: #adb5bd; font-size: 12px;');
console.log('%cReady for backend integration!', 'color: #51cf66; font-size: 12px;');

// Made with Bob

// ===================================
// AI Chat Functionality
// ===================================

function toggleAIChat() {
    const chatWindow = document.getElementById('aiChatWindow');
    chatWindow.classList.toggle('open');
    
    // Focus input when opening
    if (chatWindow.classList.contains('open')) {
        document.getElementById('chatInput').focus();
    }
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) {
        return;
    }
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    
    // Clear input
    input.value = '';
    
    // Show typing indicator
    const typingId = addTypingIndicator();
    
    // Disable send button
    const sendBtn = document.querySelector('.chat-send-btn');
    sendBtn.disabled = true;
    sendBtn.textContent = 'Thinking...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/watsonx/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: message })
        });
        
        const result = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator(typingId);
        
        if (result.success) {
            // Add AI response to chat
            addMessageToChat(result.data.response, 'ai');
            console.log('🤖 AI Response received');
        } else {
            addMessageToChat(
                `Sorry, I encountered an error: ${result.message || result.error}`,
                'ai'
            );
            console.error('❌ AI Error:', result);
        }
    } catch (error) {
        removeTypingIndicator(typingId);
        addMessageToChat(
            'Sorry, I\'m having trouble connecting to the AI service. Please try again later.',
            'ai'
        );
        console.error('❌ Chat Error:', error);
    } finally {
        // Re-enable send button
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send';
    }
}

function addMessageToChat(message, type) {
    const chatMessages = document.getElementById('chatMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = type === 'user' ? '👤' : '🤖';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    // Convert line breaks to paragraphs
    const paragraphs = message.split('\n').filter(p => p.trim());
    paragraphs.forEach(para => {
        const p = document.createElement('p');
        p.textContent = para;
        content.appendChild(p);
    });
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message ai-message';
    typingDiv.id = 'typing-indicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '🤖';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    
    content.appendChild(indicator);
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(content);
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return 'typing-indicator';
}

function removeTypingIndicator(id) {
    const indicator = document.getElementById(id);
    if (indicator) {
        indicator.remove();
    }
}
