import { Repository } from 'typeorm';
import { WebhookEvent } from './entities/webhook-event.entity';
import { GatewayService } from '../../gateways/gateway.service';
import { TransactionsService } from '../transactions/transactions.service';
import { GatewayType, WebhookBacklogSummary, WebhookEventFilters, WebhookEventSummary, WebhookProcessingStatus, WebhookReliabilitySummary } from '../../common/types';
import { AuditService } from '../audit/audit.service';
interface ProcessWebhookPayload {
    gateway: GatewayType;
    payload: string | Record<string, unknown>;
    headers: Record<string, string | string[] | undefined>;
}
interface ProcessWebhookResult {
    success: boolean;
    eventId?: string;
    message?: string;
    status: WebhookProcessingStatus;
}
export declare class WebhooksService {
    private readonly webhookEventRepository;
    private readonly gatewayService;
    private readonly transactionsService;
    private readonly auditService;
    private readonly logger;
    private readonly MAX_RETRIES;
    private readonly REPLAYABLE_STATUSES;
    constructor(webhookEventRepository: Repository<WebhookEvent>, gatewayService: GatewayService, transactionsService: TransactionsService, auditService: AuditService);
    processWebhook({ gateway, payload, headers, }: ProcessWebhookPayload): Promise<ProcessWebhookResult>;
    private processEvent;
    private handleStripeEvent;
    private handlePayPalEvent;
    private handleRazorpayEvent;
    private handleBkashEvent;
    replayWebhook(eventId: string, reason?: string): Promise<{
        success: boolean;
        message?: string;
        status?: WebhookProcessingStatus;
    }>;
    retryWebhook(eventId: string): Promise<{
        success: boolean;
        message?: string;
    }>;
    processFailedWebhooks(): Promise<void>;
    findAll(page?: number, limit?: number, filters?: WebhookEventFilters): Promise<{
        data: WebhookEvent[];
        total: number;
        page: number;
        limit: number;
        summary: WebhookEventSummary;
    }>;
    findOne(eventId: string): Promise<WebhookEvent | null>;
    getBacklogSummary(): Promise<WebhookBacklogSummary>;
    getReliabilitySummary(): Promise<WebhookReliabilitySummary>;
    private normalizeHeaders;
    private parsePayload;
    private buildNormalizedEventKey;
    private resolveSignatureStatus;
    private buildListFilters;
    private getEventFeedSummary;
    private resolveReliabilityStatus;
    private markEventProcessing;
    private markEventProcessed;
    private markEventFailed;
    private recordReplayAttempt;
}
export {};
