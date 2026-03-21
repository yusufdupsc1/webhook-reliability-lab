import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IGateway } from '../interfaces/gateway.interface';
import { GatewayType, TransactionStatus, RefundStatus, PaymentCustomer, PaymentMetadata, PaymentResponse, RefundResponse, WebhookVerificationResult } from '../../common/types';

@Injectable()
export class PhonePeGateway implements IGateway {
  private readonly logger = new Logger(PhonePeGateway.name);
  readonly type = GatewayType.PHONEPE;
  readonly name = 'PhonePe (India)';

  private readonly merchantId: string;
  private readonly saltKey: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.merchantId = this.configService.get<string>('PHONEPE_MERCHANT_ID') || '';
    this.saltKey = this.configService.get<string>('PHONEPE_SALT_KEY') || '';
    this.baseUrl = this.configService.get<string>('PHONEPE_BASE_URL') || 'https://api-preprod.phonepe.com/apis/pg-sandbox';
  }

  async createPayment(amount: number, currency: string, customer: PaymentCustomer, idempotencyKey: string, metadata?: PaymentMetadata, returnUrl?: string): Promise<PaymentResponse> {
    this.logger.warn('PhonePe gateway - payment creation not fully implemented');
    return { success: false, gateway: this.type, status: TransactionStatus.FAILED, message: 'PhonePe not implemented' };
  }

  async verifyWebhook(payload: string | Record<string, unknown>, headers: Record<string, string>): Promise<WebhookVerificationResult> {
    return { valid: true, eventId: (payload as Record<string, unknown>).transactionId as string, eventType: (payload as Record<string, unknown>).state as string, payload };
  }

  async createRefund(transactionExternalId: string, amount: number, reason?: string): Promise<RefundResponse> {
    return { success: false, status: RefundStatus.FAILED, message: 'PhonePe refund not implemented' };
  }

  async getPaymentStatus(externalId: string): Promise<PaymentResponse> {
    return { success: false, gateway: this.type, status: TransactionStatus.PENDING };
  }

  mapStatus(gatewayStatus: string): TransactionStatus {
    return gatewayStatus === 'COMPLETED' ? TransactionStatus.COMPLETED : TransactionStatus.PENDING;
  }
}
