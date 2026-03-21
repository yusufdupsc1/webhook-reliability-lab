export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  DISPUTED = 'disputed',
}

export enum RefundStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum GatewayType {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  BKASH = 'bkash',
  NAGAD = 'nagad',
  RAZORPAY = 'razorpay',
  SSLCOMMERZ = 'sslcommerz',
  AAMARPAY = 'aamarpay',
  PAYTM = 'paytm',
  PHONEPE = 'phonepe',
  UPI = 'upi',
  MERCADOPAGO = 'mercadopago',
  FLUTTERWAVE = 'flutterwave',
  PAYSTACK = 'paystack',
  SQUARE = 'square',
  ADYEN = 'adyen',
}

export interface PaymentCustomer {
  email: string;
  phone: string;
  name?: string;
  address?: {
    line1?: string;
    city?: string;
    country?: string;
    postalCode?: string;
  };
}

export interface PaymentMetadata {
  orderId?: string;
  userId?: string;
  description?: string;
  [key: string]: unknown;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  externalId?: string;
  gateway: GatewayType;
  gatewayResponse?: unknown;
  paymentUrl?: string;
  status: TransactionStatus;
  message?: string;
}

export interface RefundResponse {
  success: boolean;
  refundId?: string;
  externalRefundId?: string;
  status: RefundStatus;
  message?: string;
}

export interface WebhookVerificationResult {
  valid: boolean;
  eventId?: string;
  eventType?: string;
  payload?: unknown;
  error?: string;
}
