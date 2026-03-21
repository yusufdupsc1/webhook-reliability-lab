# Payment Dashboard - Technical Specification

## Project Overview
- **Project Name**: PayNest - Unified Payment Dashboard
- **Type**: NestJS Backend API + React Dashboard
- **Core Functionality**: Multi-gateway payment orchestration with unified transaction management, webhook processing, and analytics
- **Target Users**: Businesses needing consolidated payment oversight across 15+ payment providers

## Architecture

### Tech Stack
- **Backend**: NestJS (Node.js) with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Cache/Queue**: Redis for idempotency keys and job queues
- **Docker**: Multi-stage Dockerfile for production

### Supported Payment Gateways (15+)
1. Stripe
2. PayPal
3. bKash (Bangladesh)
4. Nagad (Bangladesh)
5. Razorpay (India)
6. SSLCommerz (Bangladesh)
7. Aamarpay (Bangladesh)
8. Paytm (India)
9. PhonePe (India)
10. UPI (India)
11. Mercado Pago (Latin America)
12. Flutterwave (Africa)
13. Paystack (Africa)
14. Square (US/Canada)
15. Adyen (Global)

## Database Schema

### Tables

#### `transactions`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| external_id | VARCHAR(255) | Gateway-specific transaction ID |
| gateway | VARCHAR(50) | Payment gateway name |
| amount | DECIMAL(15,2) | Transaction amount |
| currency | VARCHAR(3) | ISO currency code |
| status | ENUM | pending, completed, failed, refunded, disputed |
| customer_email | VARCHAR(255) | Customer email |
| customer_phone | VARCHAR(50) | Customer phone |
| metadata | JSONB | Gateway-specific data |
| idempotency_key | VARCHAR(255) | Unique key for deduplication |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

#### `webhook_events`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| gateway | VARCHAR(50) | Source gateway |
| event_id | VARCHAR(255) | Gateway's event ID |
| event_type | VARCHAR(100) | Event type |
| payload | JSONB | Raw webhook payload |
| processed | BOOLEAN | Processing status |
| processed_at | TIMESTAMP | When processed |
| retry_count | INTEGER | Number of retries |
| error_message | TEXT | Error if failed |

#### `refunds`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| transaction_id | UUID | FK to transactions |
| external_refund_id | VARCHAR(255) | Gateway's refund ID |
| amount | DECIMAL(15,2) | Refund amount |
| status | ENUM | pending, completed, failed |
| reason | TEXT | Refund reason |
| metadata | JSONB | Additional data |
| created_at | TIMESTAMP | Creation time |

#### `analytics_daily`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| date | DATE | Aggregation date |
| gateway | VARCHAR(50) | Gateway name |
| total_transactions | INTEGER | Count |
| total_amount | DECIMAL(15,2) | Sum |
| total_refunds | DECIMAL(15,2) | Refund sum |
| net_amount | DECIMAL(15,2) | net after refunds |

## API Endpoints

### Transactions
- `POST /api/v1/transactions/initiate` - Create payment
- `GET /api/v1/transactions` - List transactions (paginated)
- `GET /api/v1/transactions/:id` - Get transaction details
- `POST /api/v1/transactions/:id/refund` - Initiate refund

### Webhooks
- `POST /webhooks/stripe` - Stripe webhook
- `POST /webhooks/paypal` - PayPal webhook
- `POST /webhooks/bkash` - bKash webhook
- `POST /webhooks/nagad` - Nagad webhook
- `POST /webhooks/razorpay` - Razorpay webhook
- `POST /webhooks/*` - Generic webhook for other gateways

### Analytics
- `GET /api/v1/analytics/summary` - Dashboard summary
- `GET /api/v1/analytics/by-gateway` - Per-gateway breakdown
- `GET /api/v1/analytics/trends` - Time-series data
- `GET /api/v1/analytics/refunds` - Refund analytics

### Health & Admin
- `GET /api/v1/health` - Health check
- `GET /api/v1/gateways` - List supported gateways
- `POST /api/v1/admin/retry-webhook/:id` - Manual webhook retry

## Core Features

### 1. Unified Payment Initiation
```typescript
interface PaymentRequest {
  gateway: GatewayType;
  amount: number;
  currency: string;
  customer: {
    email: string;
    phone: string;
    name?: string;
  };
  idempotencyKey: string;
  metadata?: Record<string, any>;
  returnUrl?: string;
}
```

### 2. Webhook Signature Verification
Each gateway has custom signature verification:
- Stripe: HMAC-SHA256 with `stripe-signature` header
- PayPal: Verify webhook signature via PayPal API
- bKash: Token validation with merchant credentials
- Razorpay: HMAC-SHA256 with `x-razorpay-signature` header
- Others: Per gateway specification

### 3. Idempotency Implementation
- Redis-based idempotency key storage
- 24-hour key expiration
- Transaction mapping for duplicate detection
- Automatic conflict resolution

### 4. Retry Logic
- Exponential backoff: 1s, 2s, 4s, 8s, 16s (max 5 retries)
- Dead letter queue after max retries
- Manual retry capability via admin API
- Webhook event replay support

### 5. Transaction States
```
pending → completed (success)
pending → failed (declined/error)
completed → refunded (full refund)
completed → partially_refunded (partial refund)
completed → disputed (chargeback)
```

## Project Structure
```
/workspace/payment-dashboard/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   └── gateway.config.ts
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── utils/
│   ├── modules/
│   │   ├── transactions/
│   │   ├── webhooks/
│   │   ├── refunds/
│   │   ├── analytics/
│   │   └── health/
│   └── gateways/
│       ├── stripe/
│       ├── paypal/
│       ├── bkash/
│       ├── nagad/
│       ├── razorpay/
│       └── ... (others)
├── test/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── supabase/
│   └── migrations/
├── package.json
├── tsconfig.json
└── README.md
```

## Security Requirements
- All webhook endpoints verify signatures before processing
- Idempotency keys prevent duplicate transactions
- Rate limiting on all endpoints
- Input validation on all requests
- Environment variables for all secrets
- CORS configuration for dashboard access

## Docker Configuration
- Multi-stage build (builder → production)
- Non-root user in container
- Health check endpoint
- Environment-based configuration
- Volume for persistent data
