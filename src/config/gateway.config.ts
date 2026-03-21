export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
}

export interface GatewayCredentials {
  apiKey: string;
  apiSecret?: string;
  merchantId?: string;
  webhookSecret?: string;
  environment: 'sandbox' | 'production';
}

export interface GatewayConfig {
  stripe?: GatewayCredentials;
  paypal?: GatewayCredentials;
  bkash?: GatewayCredentials;
  nagad?: GatewayCredentials;
  razorpay?: GatewayCredentials;
  sslcommerz?: GatewayCredentials;
  aamarpay?: GatewayCredentials;
  paytm?: GatewayCredentials;
  phonepe?: GatewayCredentials;
  upi?: GatewayCredentials;
  mercadopago?: GatewayCredentials;
  flutterwave?: GatewayCredentials;
  paystack?: GatewayCredentials;
  square?: GatewayCredentials;
  adyen?: GatewayCredentials;
}
