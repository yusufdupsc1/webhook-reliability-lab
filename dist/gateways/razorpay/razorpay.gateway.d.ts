import { ConfigService } from '@nestjs/config';
import { IGateway } from '../interfaces/gateway.interface';
import { GatewayType, TransactionStatus, PaymentCustomer, PaymentMetadata, PaymentResponse, RefundResponse, WebhookVerificationResult } from '../../common/types';
export declare class RazorpayGateway implements IGateway {
    private readonly configService;
    private readonly logger;
    readonly type = GatewayType.RAZORPAY;
    readonly name = "Razorpay (India)";
    private readonly keyId;
    private readonly keySecret;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    createPayment(amount: number, currency: string, customer: PaymentCustomer, idempotencyKey: string, metadata?: PaymentMetadata, returnUrl?: string): Promise<PaymentResponse>;
    verifyWebhook(payload: string | Record<string, unknown>, headers: Record<string, string>): Promise<WebhookVerificationResult>;
    createRefund(transactionExternalId: string, amount: number, reason?: string): Promise<RefundResponse>;
    getPaymentStatus(externalId: string): Promise<PaymentResponse>;
    mapStatus(gatewayStatus: string): TransactionStatus;
}
