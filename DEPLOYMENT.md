# Deployment Guide

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vercel       │     │   Railway       │     │   Supabase     │
│   (Frontend)   │────▶│   (NestJS API)  │────▶│   (PostgreSQL) │
│   dashboard    │     │   Port 3000     │     │   Database     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Step 1: Setup Supabase PostgreSQL

1. Go to https://supabase.com and create an account
2. Create a new project
3. Get your connection string from Settings → Database → Connection String
4. Note your database password

## Step 2: Deploy NestJS Backend to Railway

1. Go to https://railway.app and connect your GitHub
2. Click "New Project" → "Deploy from GitHub"
3. Select your repo: `yusufdupsc1/webhook-reliability-lab`
4. Railway will auto-detect NestJS

### Configure Environment Variables in Railway:

```
NODE_ENV=production
PORT=3000
DB_HOST=<your-supabase-host>
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<your-supabase-password>
DB_DATABASE=postgres
REDIS_HOST=<railway-redis or upstash-url>
REDIS_PORT=6379
CORS_ORIGIN=https://your-vercel-frontend.vercel.app
```

### Add Init Script (Railway start command):
```bash
npx typeorm migration:run -d src/config/data-source.ts && npm run start:prod
```

Or create a `start.sh`:
```bash
#!/bin/bash
npm run migration:run && node dist/main.js
```

## Step 3: Deploy Frontend to Vercel

1. Go to https://vercel.com and import your GitHub repo
2. Since repo is NestJS, create a separate `frontend` folder or deploy as-is
3. Update `public/dashboard.html` to point to your Railway backend URL:

```javascript
const API_URL = 'https://your-railway-app.railway.app';
```

## Step 4: Update Dashboard for Production

In `public/dashboard.html`, change:
```javascript
const API_URL = window.location.origin.replace(/:\d+$/, ':3000');
```
to:
```javascript
const API_URL = 'https://your-railway-app.railway.app';
```

## Quick Alternative: All-in-One Deploy (Render)

1. Go to https://render.com
2. Create Web Service from your GitHub repo
3. Build command: `npm run build`
4. Start command: `npm run start:prod`
5. Add same environment variables as Railway

## Database Migration

Run this SQL in Supabase SQL Editor:

```sql
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

CREATE INDEX idx_transactions_idempotency_key ON transactions(idempotency_key);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);
```

## Verification

After deployment, test these endpoints:

1. **Health Check**: `https://your-api.railway.app/health`
2. **Gateways**: `https://your-api.railway.app/health/gateways`
3. **Dashboard**: `https://your-api.railway.app/`

## Payment Gateway Setup

Each gateway needs its API keys configured. See `.env.example` for all required variables:

- **Stripe**: https://dashboard.stripe.com/apikeys
- **PayPal**: https://developer.paypal.com/
- **bKash**: https://developer.bka.sh/
- **Nagad**: https://developer.nagad.com.bd/
- **Razorpay**: https://dashboard.razorpay.com/app/keys

Add gateway credentials to Railway environment variables.
