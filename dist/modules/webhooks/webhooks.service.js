"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WebhooksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const typeorm_2 = require("typeorm");
const webhook_event_entity_1 = require("./entities/webhook-event.entity");
const gateway_service_1 = require("../../gateways/gateway.service");
const transactions_service_1 = require("../transactions/transactions.service");
const types_1 = require("../../common/types");
const retry_util_1 = require("../../common/utils/retry.util");
const crypto_util_1 = require("../../common/utils/crypto.util");
const audit_service_1 = require("../audit/audit.service");
let WebhooksService = WebhooksService_1 = class WebhooksService {
    constructor(webhookEventRepository, gatewayService, transactionsService, auditService) {
        this.webhookEventRepository = webhookEventRepository;
        this.gatewayService = gatewayService;
        this.transactionsService = transactionsService;
        this.auditService = auditService;
        this.logger = new common_1.Logger(WebhooksService_1.name);
        this.MAX_RETRIES = 5;
        this.REPLAYABLE_STATUSES = [
            types_1.WebhookProcessingStatus.RECEIVED,
            types_1.WebhookProcessingStatus.PROCESSED,
            types_1.WebhookProcessingStatus.FAILED,
            types_1.WebhookProcessingStatus.DUPLICATE,
        ];
    }
    async processWebhook({ gateway, payload, headers, }) {
        const normalizedHeaders = this.normalizeHeaders(headers);
        const rawBody = typeof payload === 'string' ? payload : JSON.stringify(payload);
        const verification = await this.gatewayService.verifyWebhook(gateway, payload, normalizedHeaders);
        const normalizedEventKey = this.buildNormalizedEventKey(gateway, verification.eventId, verification.eventType, verification.payload);
        const persistedEventId = verification.eventId || normalizedEventKey;
        const parsedPayload = (verification.payload || this.parsePayload(payload));
        const existingEvent = await this.webhookEventRepository.findOne({
            where: { gateway, eventId: persistedEventId },
        });
        const event = existingEvent || this.webhookEventRepository.create();
        event.gateway = gateway;
        event.eventId = persistedEventId;
        event.eventType = verification.eventType || event.eventType || 'unknown';
        event.normalizedEventKey = normalizedEventKey;
        event.payload = parsedPayload;
        event.rawBody = rawBody;
        event.headers = normalizedHeaders;
        event.receivedAt = event.receivedAt || new Date();
        event.signatureValid = verification.valid;
        event.signatureStatus = this.resolveSignatureStatus(gateway, verification.valid);
        if (!verification.valid) {
            event.status = types_1.WebhookProcessingStatus.INVALID_SIGNATURE;
            event.errorMessage = verification.error || 'Invalid signature';
            event.processingStartedAt = null;
            event.nextRetryAt = null;
            await this.webhookEventRepository.save(event);
            this.logger.warn(`Invalid webhook from ${gateway}: ${verification.error}`);
            return {
                success: false,
                eventId: event.eventId,
                message: event.errorMessage,
                status: event.status,
            };
        }
        if (existingEvent &&
            [types_1.WebhookProcessingStatus.PROCESSED, types_1.WebhookProcessingStatus.DUPLICATE].includes(existingEvent.status)) {
            this.logger.log(`Duplicate webhook event ${event.eventId} ignored`);
            return {
                success: true,
                eventId: event.eventId,
                message: 'Duplicate webhook event',
                status: types_1.WebhookProcessingStatus.DUPLICATE,
            };
        }
        await this.markEventProcessing(event);
        try {
            await this.processEvent(gateway, event.eventType, parsedPayload);
            await this.markEventProcessed(event);
            return {
                success: true,
                eventId: event.eventId,
                status: event.status,
            };
        }
        catch (error) {
            await this.markEventFailed(event, error);
            return {
                success: false,
                eventId: event.eventId,
                message: event.errorMessage || 'Unknown error',
                status: event.status,
            };
        }
    }
    async processEvent(gateway, eventType, payload) {
        switch (gateway) {
            case types_1.GatewayType.STRIPE:
                await this.handleStripeEvent(eventType, payload);
                break;
            case types_1.GatewayType.PAYPAL:
                await this.handlePayPalEvent(eventType, payload);
                break;
            case types_1.GatewayType.RAZORPAY:
                await this.handleRazorpayEvent(eventType, payload);
                break;
            case types_1.GatewayType.BKASH:
                await this.handleBkashEvent(payload);
                break;
            default:
                this.logger.log(`Unhandled webhook event: ${gateway} - ${eventType}`);
        }
    }
    async handleStripeEvent(eventType, payload) {
        const stripeObject = payload;
        if (eventType === 'checkout.session.completed' || eventType === 'payment_intent.succeeded') {
            const transaction = await this.transactionsService.findByExternalId(stripeObject.id || '', types_1.GatewayType.STRIPE);
            if (transaction) {
                await this.transactionsService.updateStatus(transaction.id, types_1.TransactionStatus.COMPLETED, payload, 'webhooks.stripe', { eventType });
            }
        }
        else if (eventType === 'payment_intent.payment_failed') {
            const transaction = await this.transactionsService.findByExternalId(stripeObject.id || '', types_1.GatewayType.STRIPE);
            if (transaction) {
                await this.transactionsService.updateStatus(transaction.id, types_1.TransactionStatus.FAILED, payload, 'webhooks.stripe', { eventType });
            }
        }
    }
    async handlePayPalEvent(eventType, payload) {
        const resource = payload.resource;
        if (eventType === 'CHECKOUT.ORDER.APPROVED' || eventType === 'PAYMENT.CAPTURE.COMPLETED') {
            const transaction = await this.transactionsService.findByExternalId(resource?.id || '', types_1.GatewayType.PAYPAL);
            if (transaction) {
                await this.transactionsService.updateStatus(transaction.id, types_1.TransactionStatus.COMPLETED, payload, 'webhooks.paypal', { eventType });
            }
        }
    }
    async handleRazorpayEvent(eventType, payload) {
        const payloadObj = payload;
        const payment = payloadObj?.payload?.payment?.entity;
        const order = payloadObj?.payload?.order?.entity;
        if (eventType === 'payment.captured' && payment) {
            const transaction = await this.transactionsService.findByExternalId(payment.id || order?.id || '', types_1.GatewayType.RAZORPAY);
            if (transaction) {
                await this.transactionsService.updateStatus(transaction.id, types_1.TransactionStatus.COMPLETED, payload, 'webhooks.razorpay', { eventType });
            }
        }
    }
    async handleBkashEvent(payload) {
        const paymentId = payload.payment_id;
        const status = payload.status;
        if (status === 'success' && paymentId) {
            const transaction = await this.transactionsService.findByExternalId(paymentId, types_1.GatewayType.BKASH);
            if (transaction) {
                await this.transactionsService.updateStatus(transaction.id, types_1.TransactionStatus.COMPLETED, payload, 'webhooks.bkash', { eventType: 'payment.success' });
            }
        }
    }
    async replayWebhook(eventId, reason) {
        const event = await this.webhookEventRepository.findOne({ where: { id: eventId } });
        if (!event) {
            return { success: false, message: 'Webhook event not found' };
        }
        if (event.signatureStatus === types_1.WebhookSignatureStatus.INVALID) {
            await this.recordReplayAttempt(event, event.status, event.status, reason, 'blocked', {
                message: 'Invalid signature events cannot be replayed',
            });
            return { success: false, message: 'Invalid signature events cannot be replayed' };
        }
        if (event.status === types_1.WebhookProcessingStatus.PROCESSING) {
            await this.recordReplayAttempt(event, event.status, event.status, reason, 'blocked', {
                message: 'Webhook event is already processing',
            });
            return { success: false, message: 'Webhook event is already processing', status: event.status };
        }
        const previousStatus = event.status;
        const replayReason = reason?.trim() || 'manual_admin_replay';
        try {
            await this.markEventProcessing(event);
            await this.processEvent(event.gateway, event.eventType, event.payload);
            event.replayCount += 1;
            event.lastReplayAt = new Date();
            event.lastReplayReason = replayReason;
            await this.markEventProcessed(event);
            await this.recordReplayAttempt(event, previousStatus, event.status, replayReason, 'processed');
            return { success: true, status: event.status };
        }
        catch (error) {
            event.replayCount += 1;
            event.lastReplayAt = new Date();
            event.lastReplayReason = replayReason;
            await this.markEventFailed(event, error);
            await this.recordReplayAttempt(event, previousStatus, event.status, replayReason, 'failed', {
                errorMessage: event.errorMessage,
            });
            return { success: false, message: event.errorMessage || 'Unknown error', status: event.status };
        }
    }
    async retryWebhook(eventId) {
        const event = await this.webhookEventRepository.findOne({ where: { id: eventId } });
        if (!event) {
            return { success: false, message: 'Webhook event not found' };
        }
        if (event.status === types_1.WebhookProcessingStatus.PROCESSED) {
            return { success: true, message: 'Event already processed' };
        }
        if (event.status === types_1.WebhookProcessingStatus.INVALID_SIGNATURE) {
            return { success: false, message: 'Invalid signature events cannot be retried' };
        }
        if (event.retryCount >= this.MAX_RETRIES) {
            return { success: false, message: 'Max retries exceeded' };
        }
        try {
            await this.markEventProcessing(event);
            await this.processEvent(event.gateway, event.eventType, event.payload);
            await this.markEventProcessed(event);
            return { success: true };
        }
        catch (error) {
            await this.markEventFailed(event, error);
            return { success: false, message: event.errorMessage || 'Unknown error' };
        }
    }
    async processFailedWebhooks() {
        const failedEvents = await this.webhookEventRepository.find({
            where: [
                {
                    status: types_1.WebhookProcessingStatus.FAILED,
                    nextRetryAt: (0, typeorm_2.LessThanOrEqual)(new Date()),
                },
                {
                    status: types_1.WebhookProcessingStatus.RECEIVED,
                    nextRetryAt: (0, typeorm_2.IsNull)(),
                },
            ],
            order: { createdAt: 'ASC' },
            take: 100,
        });
        for (const event of failedEvents) {
            if (event.retryCount < this.MAX_RETRIES) {
                await this.retryWebhook(event.id);
            }
        }
    }
    async findAll(page = 1, limit = 20, filters = {}) {
        const where = this.buildListFilters(filters);
        const [data, total, summary] = await Promise.all([
            this.webhookEventRepository.find({
                where,
                order: { createdAt: 'DESC' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.webhookEventRepository.count({ where }),
            this.getEventFeedSummary(where),
        ]);
        return { data, total, page, limit, summary };
    }
    async findOne(eventId) {
        return this.webhookEventRepository.findOne({ where: { id: eventId } });
    }
    async getBacklogSummary() {
        const pendingStatuses = [
            types_1.WebhookProcessingStatus.RECEIVED,
            types_1.WebhookProcessingStatus.PROCESSING,
            types_1.WebhookProcessingStatus.FAILED,
        ];
        const [total, retryable, failed, processing, invalidSignature, oldestPendingEvent] = await Promise.all([
            this.webhookEventRepository.count({
                where: {
                    status: (0, typeorm_2.In)(pendingStatuses),
                },
            }),
            this.webhookEventRepository.count({
                where: {
                    status: types_1.WebhookProcessingStatus.FAILED,
                    nextRetryAt: (0, typeorm_2.LessThanOrEqual)(new Date()),
                },
            }),
            this.webhookEventRepository.count({
                where: { status: types_1.WebhookProcessingStatus.FAILED },
            }),
            this.webhookEventRepository.count({
                where: { status: types_1.WebhookProcessingStatus.PROCESSING },
            }),
            this.webhookEventRepository.count({
                where: { status: types_1.WebhookProcessingStatus.INVALID_SIGNATURE },
            }),
            this.webhookEventRepository.findOne({
                where: {
                    status: (0, typeorm_2.In)(pendingStatuses),
                },
                order: { receivedAt: 'ASC' },
            }),
        ]);
        return {
            total,
            retryable,
            failed,
            processing,
            invalidSignature,
            oldestPendingAt: oldestPendingEvent?.receivedAt?.toISOString() || null,
        };
    }
    async getReliabilitySummary() {
        const backlog = await this.getBacklogSummary();
        const now = Date.now();
        const recentWindowStart = new Date(now - 24 * 60 * 60 * 1000);
        const [replayable, blockedReplay, maxRetriesExceeded, replayed, recentReceived, recentProcessed, recentFailed, recentInvalidSignature, lastReceivedEvent, lastProcessedEvent,] = await Promise.all([
            this.webhookEventRepository.count({
                where: {
                    signatureStatus: (0, typeorm_2.In)([
                        types_1.WebhookSignatureStatus.VALID,
                        types_1.WebhookSignatureStatus.NOT_APPLICABLE,
                        types_1.WebhookSignatureStatus.PENDING,
                    ]),
                    status: (0, typeorm_2.In)(this.REPLAYABLE_STATUSES),
                },
            }),
            this.webhookEventRepository.count({
                where: {
                    signatureStatus: types_1.WebhookSignatureStatus.INVALID,
                },
            }),
            this.webhookEventRepository.count({
                where: {
                    status: types_1.WebhookProcessingStatus.FAILED,
                    nextRetryAt: (0, typeorm_2.IsNull)(),
                },
            }),
            this.webhookEventRepository.count({
                where: {
                    replayCount: (0, typeorm_2.MoreThan)(0),
                },
            }),
            this.webhookEventRepository.count({
                where: {
                    receivedAt: (0, typeorm_2.MoreThan)(recentWindowStart),
                },
            }),
            this.webhookEventRepository.count({
                where: {
                    processedAt: (0, typeorm_2.MoreThan)(recentWindowStart),
                    status: types_1.WebhookProcessingStatus.PROCESSED,
                },
            }),
            this.webhookEventRepository.count({
                where: {
                    updatedAt: (0, typeorm_2.MoreThan)(recentWindowStart),
                    status: types_1.WebhookProcessingStatus.FAILED,
                },
            }),
            this.webhookEventRepository.count({
                where: {
                    updatedAt: (0, typeorm_2.MoreThan)(recentWindowStart),
                    status: types_1.WebhookProcessingStatus.INVALID_SIGNATURE,
                },
            }),
            this.webhookEventRepository.findOne({
                order: { receivedAt: 'DESC' },
            }),
            this.webhookEventRepository.findOne({
                where: { status: types_1.WebhookProcessingStatus.PROCESSED },
                order: { processedAt: 'DESC' },
            }),
        ]);
        const backlogAgeSeconds = backlog.oldestPendingAt
            ? Math.max(0, Math.round((now - new Date(backlog.oldestPendingAt).getTime()) / 1000))
            : null;
        return {
            status: this.resolveReliabilityStatus(backlog),
            replayable,
            blockedReplay,
            maxRetriesExceeded,
            lastReceivedAt: lastReceivedEvent?.receivedAt?.toISOString() || null,
            lastProcessedAt: lastProcessedEvent?.processedAt?.toISOString() || null,
            backlogAgeSeconds,
            recent24h: {
                received: recentReceived,
                processed: recentProcessed,
                failed: recentFailed,
                invalidSignature: recentInvalidSignature,
                replayed,
            },
        };
    }
    normalizeHeaders(headers) {
        return Object.entries(headers).reduce((acc, [key, value]) => {
            if (typeof value === 'undefined') {
                return acc;
            }
            acc[key] = Array.isArray(value) ? value.join(', ') : String(value);
            return acc;
        }, {});
    }
    parsePayload(payload) {
        if (typeof payload !== 'string') {
            return payload;
        }
        try {
            return JSON.parse(payload);
        }
        catch {
            return { raw: payload };
        }
    }
    buildNormalizedEventKey(gateway, eventId, eventType, payload) {
        if (eventId) {
            return `${gateway}:${eventId}`;
        }
        return `${gateway}:${eventType || 'unknown'}:${crypto_util_1.CryptoUtil.hashData(JSON.stringify(payload || {}))}`;
    }
    resolveSignatureStatus(gateway, valid) {
        const gatewaysWithExplicitSignatureCheck = new Set([
            types_1.GatewayType.STRIPE,
            types_1.GatewayType.RAZORPAY,
            types_1.GatewayType.PAYPAL,
            types_1.GatewayType.BKASH,
            types_1.GatewayType.NAGAD,
        ]);
        if (!gatewaysWithExplicitSignatureCheck.has(gateway)) {
            return types_1.WebhookSignatureStatus.NOT_APPLICABLE;
        }
        return valid ? types_1.WebhookSignatureStatus.VALID : types_1.WebhookSignatureStatus.INVALID;
    }
    buildListFilters(filters) {
        const where = {};
        if (filters.gateway) {
            where.gateway = filters.gateway;
        }
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.signatureStatus) {
            where.signatureStatus = filters.signatureStatus;
        }
        if (typeof filters.replayable === 'boolean') {
            where.signatureStatus = filters.replayable
                ? (0, typeorm_2.In)([
                    types_1.WebhookSignatureStatus.VALID,
                    types_1.WebhookSignatureStatus.NOT_APPLICABLE,
                    types_1.WebhookSignatureStatus.PENDING,
                ])
                : types_1.WebhookSignatureStatus.INVALID;
            where.status = filters.replayable
                ? (0, typeorm_2.In)(this.REPLAYABLE_STATUSES)
                : types_1.WebhookProcessingStatus.INVALID_SIGNATURE;
        }
        return where;
    }
    async getEventFeedSummary(where) {
        const events = await this.webhookEventRepository.find({
            where,
            select: {
                gateway: true,
                status: true,
                signatureStatus: true,
            },
        });
        return events.reduce((summary, event) => {
            summary.total += 1;
            summary.byGateway[event.gateway] = (summary.byGateway[event.gateway] || 0) + 1;
            summary.byStatus[event.status] = (summary.byStatus[event.status] || 0) + 1;
            summary.bySignatureStatus[event.signatureStatus] =
                (summary.bySignatureStatus[event.signatureStatus] || 0) + 1;
            if (event.status === types_1.WebhookProcessingStatus.FAILED) {
                summary.retryable += 1;
            }
            if (event.signatureStatus !== types_1.WebhookSignatureStatus.INVALID &&
                this.REPLAYABLE_STATUSES.includes(event.status)) {
                summary.replayable += 1;
            }
            return summary;
        }, {
            total: 0,
            replayable: 0,
            retryable: 0,
            byGateway: {},
            byStatus: {},
            bySignatureStatus: {},
        });
    }
    resolveReliabilityStatus(backlog) {
        if (backlog.invalidSignature > 0 || backlog.failed > 3) {
            return 'attention';
        }
        if (backlog.total > 0 || backlog.processing > 0 || backlog.retryable > 0) {
            return 'active';
        }
        return 'healthy';
    }
    async markEventProcessing(event) {
        event.status = types_1.WebhookProcessingStatus.PROCESSING;
        event.processingStartedAt = new Date();
        event.nextRetryAt = null;
        await this.webhookEventRepository.save(event);
    }
    async markEventProcessed(event) {
        const now = new Date();
        event.status = types_1.WebhookProcessingStatus.PROCESSED;
        event.processingStartedAt = null;
        event.processedAt = now;
        event.firstProcessedAt = event.firstProcessedAt || now;
        event.errorMessage = null;
        event.nextRetryAt = null;
        await this.webhookEventRepository.save(event);
    }
    async markEventFailed(event, error) {
        event.retryCount += 1;
        event.status = types_1.WebhookProcessingStatus.FAILED;
        event.processingStartedAt = null;
        event.errorMessage = error instanceof Error ? error.message : 'Unknown error';
        event.nextRetryAt =
            event.retryCount < this.MAX_RETRIES
                ? new Date(Date.now() + retry_util_1.RetryUtil.calculateBackoff(event.retryCount))
                : null;
        await this.webhookEventRepository.save(event);
    }
    async recordReplayAttempt(event, previousStatus, nextStatus, reason, outcome, metadata) {
        await this.auditService.recordEntry({
            entityType: types_1.AuditEntityType.WEBHOOK_EVENT,
            entityId: event.id,
            webhookEventId: event.id,
            gateway: event.gateway,
            action: types_1.AuditActionType.WEBHOOK_REPLAY_ATTEMPTED,
            previousStatus,
            nextStatus,
            source: 'webhooks.replayWebhook',
            metadata: {
                eventId: event.eventId,
                eventType: event.eventType,
                replayReason: reason?.trim() || 'manual_admin_replay',
                outcome,
                replayCount: event.replayCount,
                ...(metadata || {}),
            },
        });
    }
};
exports.WebhooksService = WebhooksService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WebhooksService.prototype, "processFailedWebhooks", null);
exports.WebhooksService = WebhooksService = WebhooksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(webhook_event_entity_1.WebhookEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        gateway_service_1.GatewayService,
        transactions_service_1.TransactionsService,
        audit_service_1.AuditService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map