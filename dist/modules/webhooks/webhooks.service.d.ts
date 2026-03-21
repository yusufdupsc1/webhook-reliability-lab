import { Repository } from 'typeorm';
import { WebhookEvent } from './entities/webhook-event.entity';
import { GatewayService } from '../../gateways/gateway.service';
import { TransactionsService } from '../transactions/transactions.service';
import { GatewayType } from '../../common/types';
export declare class WebhooksService {
    private readonly webhookEventRepository;
    private readonly gatewayService;
    private readonly transactionsService;
    private readonly logger;
    private readonly MAX_RETRIES;
    constructor(webhookEventRepository: Repository<WebhookEvent>, gatewayService: GatewayService, transactionsService: TransactionsService);
    processWebhook(gateway: GatewayType, payload: string | Record<string, unknown>, headers: Record<string, string>): Promise<{
        success: boolean;
        eventId?: string;
        message?: string;
    }>;
    private processEvent;
    private handleStripeEvent;
    private handlePayPalEvent;
    private handleRazorpayEvent;
    private handleBkashEvent;
    retryWebhook(eventId: string): Promise<{
        success: boolean;
        message?: string;
    }>;
    processFailedWebhooks(): Promise<void>;
    findAll(page?: number, limit?: number): Promise<{
        data: WebhookEvent[];
        total: number;
    }>;
}
