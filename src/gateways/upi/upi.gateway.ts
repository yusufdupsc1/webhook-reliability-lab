import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IGateway } from '../interfaces/gateway.interface';
import { GatewayType, TransactionStatus, RefundStatus, PaymentCustomer, PaymentMetadata, PaymentResponse, RefundResponse, WebhookVerificationResult } from '../../common/types';

@Injectable()
export class UpiGateway implements IGateway {
  private readonly logger = new Logger(UpiGateway.name);
  readonly type = GatewayType.UPI;
  readonly name = 'UPI (India)';

  constructor(private readonly configService: ConfigService) {}

  async createPayment(amount: number, currency: string, customer: PaymentCustomer, idempotencyKey: string, metadata?: PaymentMetadata, returnUrl?: string): Promise<PaymentResponse> {
    this.logger.warn('UPI gateway - payment creation not fully implemented');
    return { success: false, gateway: this.type, status: TransactionStatus.FAILED, message: 'UPI not implemented' };
  }

  async verifyWebhook(payload: string | Record<string, unknown>, headers: Record<string, string>): Promise<WebhookVerificationResult> {
    return { valid: true, eventId: (payload as Record<string, unknown>)?.transactionId as string, eventType: (payload as Record<string, unknown>)?.status as string, payload };
  }

  async createRefund(transactionExternalId: string, amount: number, reason?: string): Promise<RefundResponse> {
    return { success: false, status: RefundStatus.FAILED, message: 'UPI refund not implemented' };
  }

  async getPaymentStatus(externalId: string): Promise<PaymentResponse> {
    return { success: false, gateway: this.type, status: TransactionStatus.PENDING };
  }

  mapStatus(gatewayStatus: string): TransactionStatus {
    return gatewayStatus === 'SUCCESS' ? TransactionStatus.COMPLETED : TransactionStatus.PENDING;
  }
}
