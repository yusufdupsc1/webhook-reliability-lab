import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WebhookEvent } from './entities/webhook-event.entity';
import { GatewayService } from '../../gateways/gateway.service';
import { TransactionsService } from '../transactions/transactions.service';
import { GatewayType, TransactionStatus } from '../../common/types';
import { RetryUtil } from '../../common/utils/retry.util';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  private readonly MAX_RETRIES = 5;

  constructor(
    @InjectRepository(WebhookEvent)
    private readonly webhookEventRepository: Repository<WebhookEvent>,
    private readonly gatewayService: GatewayService,
    private readonly transactionsService: TransactionsService,
  ) {}

  async processWebhook(
    gateway: GatewayType,
    payload: string | Record<string, unknown>,
    headers: Record<string, string>,
  ): Promise<{ success: boolean; eventId?: string; message?: string }> {
    const verification = await this.gatewayService.verifyWebhook(gateway, payload, headers);

    if (!verification.valid) {
      this.logger.warn(`Invalid webhook from ${gateway}: ${verification.error}`);
      return { success: false, message: verification.error };
    }

    const existingEvent = await this.webhookEventRepository.findOne({
      where: { gateway, eventId: verification.eventId || '' },
    });

    if (existingEvent?.processed) {
      this.logger.log(`Duplicate webhook event ${verification.eventId} ignored`);
      return { success: true, eventId: verification.eventId };
    }

    const event = existingEvent || this.webhookEventRepository.create({
      gateway,
      eventId: verification.eventId || '',
      eventType: verification.eventType || '',
      payload: verification.payload as Record<string, unknown>,
    });

    await this.webhookEventRepository.save(event);

    try {
      await this.processEvent(gateway, verification.eventType || '', verification.payload);
      event.processed = true;
      event.processedAt = new Date();
      await this.webhookEventRepository.save(event);

      return { success: true, eventId: verification.eventId };
    } catch (error) {
      event.retryCount += 1;
      event.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.webhookEventRepository.save(event);

      return { success: false, eventId: verification.eventId, message: event.errorMessage };
    }
  }

  private async processEvent(
    gateway: GatewayType,
    eventType: string,
    payload: unknown,
  ): Promise<void> {
    const payloadObj = payload as Record<string, unknown>;

    switch (gateway) {
      case GatewayType.STRIPE:
        await this.handleStripeEvent(eventType, payloadObj);
        break;
      case GatewayType.PAYPAL:
        await this.handlePayPalEvent(eventType, payloadObj);
        break;
      case GatewayType.RAZORPAY:
        await this.handleRazorpayEvent(eventType, payloadObj);
        break;
      case GatewayType.BKASH:
        await this.handleBkashEvent(eventType, payloadObj);
        break;
      default:
        this.logger.log(`Unhandled webhook event: ${gateway} - ${eventType}`);
    }
  }

  private async handleStripeEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    const paymentIntent = payload as { id?: string; data?: { object?: { id?: string; status?: string } } };
    const objectData = paymentIntent.data?.object;

    if (eventType === 'checkout.session.completed' || eventType === 'payment_intent.succeeded') {
      const transaction = await this.transactionsService.findByExternalId(
        objectData?.id || '',
        GatewayType.STRIPE,
      );
      if (transaction) {
        await this.transactionsService.updateStatus(transaction.id, TransactionStatus.COMPLETED, payload);
      }
    } else if (eventType === 'payment_intent.payment_failed') {
      const transaction = await this.transactionsService.findByExternalId(
        objectData?.id || '',
        GatewayType.STRIPE,
      );
      if (transaction) {
        await this.transactionsService.updateStatus(transaction.id, TransactionStatus.FAILED, payload);
      }
    }
  }

  private async handlePayPalEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    const resource = payload.resource as { id?: string; status?: string };

    if (eventType === 'CHECKOUT.ORDER.APPROVED' || eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const transaction = await this.transactionsService.findByExternalId(
        resource?.id || '',
        GatewayType.PAYPAL,
      );
      if (transaction) {
        await this.transactionsService.updateStatus(transaction.id, TransactionStatus.COMPLETED, payload);
      }
    }
  }

  private async handleRazorpayEvent(eventType: string, payload: unknown): Promise<void> {
    const payloadObj = payload as { payload?: { payment?: { entity?: { id?: string; status?: string } }; order?: { entity?: { id?: string; status?: string } } } };
    const payment = payloadObj?.payload?.payment?.entity;
    const order = payloadObj?.payload?.order?.entity;

    if (eventType === 'payment.captured' && payment) {
      const transaction = await this.transactionsService.findByExternalId(
        payment.id || order?.id || '',
        GatewayType.RAZORPAY,
      );
      if (transaction) {
        await this.transactionsService.updateStatus(transaction.id, TransactionStatus.COMPLETED, payload as Record<string, unknown>);
      }
    }
  }

  private async handleBkashEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    const paymentId = payload.payment_id as string;
    const status = payload.status as string;

    if (status === 'success' && paymentId) {
      const transaction = await this.transactionsService.findByExternalId(paymentId, GatewayType.BKASH);
      if (transaction) {
        await this.transactionsService.updateStatus(transaction.id, TransactionStatus.COMPLETED, payload);
      }
    }
  }

  async retryWebhook(eventId: string): Promise<{ success: boolean; message?: string }> {
    const event = await this.webhookEventRepository.findOne({ where: { id: eventId } });

    if (!event) {
      return { success: false, message: 'Webhook event not found' };
    }

    if (event.processed) {
      return { success: true, message: 'Event already processed' };
    }

    if (event.retryCount >= this.MAX_RETRIES) {
      return { success: false, message: 'Max retries exceeded' };
    }

    try {
      await this.processEvent(event.gateway, event.eventType, event.payload);
      event.processed = true;
      event.processedAt = new Date();
      await this.webhookEventRepository.save(event);
      return { success: true };
    } catch (error) {
      event.retryCount += 1;
      event.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.webhookEventRepository.save(event);
      return { success: false, message: event.errorMessage };
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async processFailedWebhooks(): Promise<void> {
    const failedEvents = await this.webhookEventRepository.find({
      where: { processed: false },
      order: { createdAt: 'ASC' },
      take: 100,
    });

    for (const event of failedEvents) {
      if (event.retryCount < this.MAX_RETRIES) {
        const delay = RetryUtil.calculateBackoff(event.retryCount + 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        await this.retryWebhook(event.id);
      }
    }
  }

  async findAll(page: number = 1, limit: number = 20): Promise<{ data: WebhookEvent[]; total: number }> {
    const [data, total] = await this.webhookEventRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }
}
