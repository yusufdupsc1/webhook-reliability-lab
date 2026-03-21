import { ConfigService } from '@nestjs/config';
import { IGateway } from '../interfaces/gateway.interface';
import { GatewayType, TransactionStatus, PaymentCustomer, PaymentMetadata, PaymentResponse, RefundResponse, WebhookVerificationResult } from '../../common/types';
export declare class NagadGateway implements IGateway {
    private readonly configService;
    private readonly logger;
    readonly type = GatewayType.NAGAD;
    readonly name = "Nagad (Bangladesh)";
    private readonly merchantId;
    private readonly merchantKey;
    private readonly baseUrl;
    private accessToken;
    private tokenExpiry;
    constructor(configService: ConfigService);
    private getAccessToken;
    createPayment(amount: number, currency: string, customer: PaymentCustomer, idempotencyKey: string, metadata?: PaymentMetadata, returnUrl?: string): Promise<PaymentResponse>;
    verifyWebhook(payload: string | Record<string, unknown>, headers: Record<string, string>): Promise<WebhookVerificationResult>;
    createRefund(transactionExternalId: string, amount: number, reason?: string): Promise<RefundResponse>;
    getPaymentStatus(externalId: string): Promise<PaymentResponse>;
    mapStatus(gatewayStatus: string): TransactionStatus;
}
