-- SimuTrader Database Schema
-- PostgreSQL Database Setup

-- Create database (run this separately if needed)
-- CREATE DATABASE simutrader;

-- Connect to the database
-- \c simutrader;

-- ===================================
-- Users Table (for future authentication)
-- ===================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 100000.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================================
-- Portfolio Table
-- ===================================
CREATE TABLE IF NOT EXISTS portfolio (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset VARCHAR(10) NOT NULL,
    quantity DECIMAL(15, 8) NOT NULL,
    avg_price DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, asset)
);

-- ===================================
-- Transactions Table
-- ===================================
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset VARCHAR(10) NOT NULL,
    type VARCHAR(4) NOT NULL CHECK (type IN ('buy', 'sell')),
    quantity DECIMAL(15, 8) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================================
-- Stocks Table (optional - for reference data)
-- ===================================
CREATE TABLE IF NOT EXISTS stocks (
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

-- ===================================
-- Indexes for Performance
-- ===================================
CREATE INDEX IF NOT EXISTS idx_portfolio_user_id ON portfolio(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_asset ON portfolio(asset);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_asset ON transactions(asset);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stocks_symbol ON stocks(symbol);

-- ===================================
-- Insert Demo User
-- ===================================
INSERT INTO users (username, email, password_hash, balance)
VALUES ('demo', 'demo@simutrader.com', 'demo_hash', 100000.00)
ON CONFLICT (username) DO NOTHING;

-- ===================================
-- Insert Sample Stocks Data
-- ===================================
INSERT INTO stocks (symbol, name, price, change, change_percent, volume, market_cap)
VALUES 
    ('AAPL', 'Apple Inc.', 178.50, 2.30, 1.31, 52000000, 2800000000000),
    ('GOOGL', 'Alphabet Inc.', 142.80, -1.20, -0.83, 28000000, 1800000000000),
    ('MSFT', 'Microsoft Corporation', 380.00, 5.50, 1.47, 35000000, 2900000000000),
    ('TSLA', 'Tesla Inc.', 245.60, -3.40, -1.37, 95000000, 780000000000),
    ('AMZN', 'Amazon.com Inc.', 155.30, 1.80, 1.17, 42000000, 1600000000000),
    ('BTC', 'Bitcoin', 45000.00, 500.00, 1.12, 0, 0),
    ('ETH', 'Ethereum', 2800.00, -50.00, -1.75, 0, 0)
ON CONFLICT (symbol) DO NOTHING;

-- ===================================
-- Insert Sample Portfolio Data (for demo user)
-- ===================================
INSERT INTO portfolio (user_id, asset, quantity, avg_price)
VALUES 
    (1, 'AAPL', 50, 165.00),
    (1, 'GOOGL', 30, 145.00),
    (1, 'MSFT', 25, 370.00)
ON CONFLICT (user_id, asset) DO NOTHING;

-- ===================================
-- Insert Sample Transactions (for demo user)
-- ===================================
INSERT INTO transactions (user_id, asset, type, quantity, price, total_amount)
VALUES 
    (1, 'AAPL', 'buy', 50, 165.00, 8250.00),
    (1, 'GOOGL', 'buy', 30, 145.00, 4350.00),
    (1, 'MSFT', 'buy', 25, 370.00, 9250.00);

-- ===================================
-- Verify Setup
-- ===================================
-- Check users
SELECT * FROM users;

-- Check portfolio
SELECT * FROM portfolio;

-- Check transactions
SELECT * FROM transactions;

-- Check stocks
SELECT * FROM stocks;

-- Made with Bob
