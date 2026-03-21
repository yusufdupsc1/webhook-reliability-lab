-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(255),
    gateway VARCHAR(50) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending',
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    customer_name VARCHAR(255),
    metadata JSONB,
    gateway_response JSONB,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    payment_url VARCHAR(500),
    return_url VARCHAR(500),
    refunded_amount DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_idempotency_key ON transactions(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_transactions_external_id_gateway ON transactions(external_id, gateway);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Create webhook_events table
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway VARCHAR(50) NOT NULL,
    event_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100),
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP,
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(gateway, event_id)
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);

-- Create refunds table
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id),
    external_refund_id VARCHAR(255),
    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    reason TEXT,
    metadata JSONB,
    gateway_response JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refunds_transaction_id ON refunds(transaction_id);
CREATE INDEX IF NOT EXISTS idx_refunds_external_refund_id ON refunds(external_refund_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);

-- Create analytics_daily table
CREATE TABLE IF NOT EXISTS analytics_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    gateway VARCHAR(50),
    total_transactions INTEGER DEFAULT 0,
    total_amount DECIMAL(15, 2) DEFAULT 0,
    total_refunds DECIMAL(15, 2) DEFAULT 0,
    net_amount DECIMAL(15, 2) DEFAULT 0,
    failed_transactions INTEGER DEFAULT 0,
    pending_transactions INTEGER DEFAULT 0,
    UNIQUE(date, gateway)
);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_date ON analytics_daily(date);
