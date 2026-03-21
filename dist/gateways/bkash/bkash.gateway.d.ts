import { ConfigService } from '@nestjs/config';
import { IGateway } from '../interfaces/gateway.interface';
import { GatewayType, TransactionStatus, PaymentCustomer, PaymentMetadata, PaymentResponse, RefundResponse, WebhookVerificationResult } from '../../common/types';
export declare class BkashGateway implements IGateway {
    private readonly configService;
    private readonly logger;
    readonly type = GatewayType.BKASH;
    readonly name = "bKash (Bangladesh)";
    private readonly apiKey;
    private readonly apiSecret;
    private readonly merchantId;
    private readonly username;
    private readonly password;
    private readonly baseUrl;
    private accessToken;
    constructor(configService: ConfigService);
    private getAccessToken;
    createPayment(amount: number, currency: string, customer: PaymentCustomer, idempotencyKey: string, metadata?: PaymentMetadata, returnUrl?: string): Promise<PaymentResponse>;
    verifyWebhook(payload: string | Record<string, unknown>, headers: Record<string, string>): Promise<WebhookVerificationResult>;
    private executePaymentStatus;
    createRefund(transactionExternalId: string, amount: number, reason?: string): Promise<RefundResponse>;
    getPaymentStatus(externalId: string): Promise<PaymentResponse>;
    mapStatus(gatewayStatus: string): TransactionStatus;
}
