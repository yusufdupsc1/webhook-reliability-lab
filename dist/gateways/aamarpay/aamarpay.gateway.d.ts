import { ConfigService } from '@nestjs/config';
import { IGateway } from '../interfaces/gateway.interface';
import { GatewayType, TransactionStatus } from '../../common/types';
import { PaymentCustomer, PaymentMetadata, PaymentResponse, RefundResponse, WebhookVerificationResult } from '../../common/types';
export declare class AamarpayGateway implements IGateway {
    private readonly configService;
    private readonly logger;
    readonly type = GatewayType.AAMARPAY;
    readonly name = "Aamarpay (Bangladesh)";
    private readonly storeId;
    private readonly signatureKey;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    createPayment(amount: number, currency: string, customer: PaymentCustomer, idempotencyKey: string, metadata?: PaymentMetadata, returnUrl?: string): Promise<PaymentResponse>;
    verifyWebhook(payload: string | Record<string, unknown>, headers: Record<string, string>): Promise<WebhookVerificationResult>;
    createRefund(transactionExternalId: string, amount: number, reason?: string): Promise<RefundResponse>;
    getPaymentStatus(externalId: string): Promise<PaymentResponse>;
    mapStatus(gatewayStatus: string): TransactionStatus;
}
