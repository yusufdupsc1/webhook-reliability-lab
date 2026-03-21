import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IGateway } from '../interfaces/gateway.interface';
import { GatewayType, TransactionStatus, RefundStatus, PaymentCustomer, PaymentMetadata, PaymentResponse, RefundResponse, WebhookVerificationResult } from '../../common/types';

@Injectable()
export class SquareGateway implements IGateway {
  private readonly logger = new Logger(SquareGateway.name);
  readonly type = GatewayType.SQUARE;
  readonly name = 'Square (US/Canada)';

  private readonly accessToken: string;
  private readonly locationId: string;
  private readonly baseUrl = 'https://connect.squareup.com/v2';

  constructor(private readonly configService: ConfigService) {
    this.accessToken = this.configService.get<string>('SQUARE_ACCESS_TOKEN') || '';
    this.locationId = this.configService.get<string>('SQUARE_LOCATION_ID') || '';
  }

  async createPayment(amount: number, currency: string, customer: PaymentCustomer, idempotencyKey: string, metadata?: PaymentMetadata, returnUrl?: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'Square-Version': '2024-01-18',
        },
        body: JSON.stringify({
          source_id: 'cnon:card-nonce-ok',
          idempotency_key: idempotencyKey,
          amount_money: { amount: Math.round(amount * 100), currency: currency || 'USD' },
          location_id: this.locationId,
          autocomplete: false,
          note: metadata?.description,
        }),
      });

      const data = await response.json() as { payment: { id: string; status: string } };
      return {
        success: data.payment?.status === 'COMPLETED',
        transactionId: data.payment?.id || idempotencyKey,
        externalId: data.payment?.id || idempotencyKey,
        gateway: this.type,
        gatewayResponse: data,
        status: data.payment?.status === 'COMPLETED' ? TransactionStatus.COMPLETED : TransactionStatus.PENDING,
      };
    } catch (error) {
      this.logger.error(`Square payment failed: ${error}`);
      return { success: false, gateway: this.type, status: TransactionStatus.FAILED, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async verifyWebhook(payload: string | Record<string, unknown>, headers: Record<string, string>): Promise<WebhookVerificationResult> {
    return { valid: true, eventId: (payload as Record<string, unknown>)?.payment_id as string, eventType: (payload as Record<string, unknown>)?.type as string, payload };
  }

  async createRefund(transactionExternalId: string, amount: number, reason?: string): Promise<RefundResponse> {
    return { success: false, status: RefundStatus.FAILED, message: 'Square refund not implemented' };
  }

  async getPaymentStatus(externalId: string): Promise<PaymentResponse> {
    return { success: false, gateway: this.type, status: TransactionStatus.PENDING };
  }

  mapStatus(gatewayStatus: string): TransactionStatus {
    return gatewayStatus === 'COMPLETED' ? TransactionStatus.COMPLETED : TransactionStatus.PENDING;
  }
}
