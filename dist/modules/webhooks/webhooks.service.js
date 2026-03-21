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
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const webhook_event_entity_1 = require("./entities/webhook-event.entity");
const gateway_service_1 = require("../../gateways/gateway.service");
const transactions_service_1 = require("../transactions/transactions.service");
const types_1 = require("../../common/types");
const retry_util_1 = require("../../common/utils/retry.util");
let WebhooksService = WebhooksService_1 = class WebhooksService {
    constructor(webhookEventRepository, gatewayService, transactionsService) {
        this.webhookEventRepository = webhookEventRepository;
        this.gatewayService = gatewayService;
        this.transactionsService = transactionsService;
        this.logger = new common_1.Logger(WebhooksService_1.name);
        this.MAX_RETRIES = 5;
    }
    async processWebhook(gateway, payload, headers) {
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
            payload: verification.payload,
        });
        await this.webhookEventRepository.save(event);
        try {
            await this.processEvent(gateway, verification.eventType || '', verification.payload);
            event.processed = true;
            event.processedAt = new Date();
            await this.webhookEventRepository.save(event);
            return { success: true, eventId: verification.eventId };
        }
        catch (error) {
            event.retryCount += 1;
            event.errorMessage = error instanceof Error ? error.message : 'Unknown error';
            await this.webhookEventRepository.save(event);
            return { success: false, eventId: verification.eventId, message: event.errorMessage };
        }
    }
    async processEvent(gateway, eventType, payload) {
        const payloadObj = payload;
        switch (gateway) {
            case types_1.GatewayType.STRIPE:
                await this.handleStripeEvent(eventType, payloadObj);
                break;
            case types_1.GatewayType.PAYPAL:
                await this.handlePayPalEvent(eventType, payloadObj);
                break;
            case types_1.GatewayType.RAZORPAY:
                await this.handleRazorpayEvent(eventType, payloadObj);
                break;
            case types_1.GatewayType.BKASH:
                await this.handleBkashEvent(eventType, payloadObj);
                break;
            default:
                this.logger.log(`Unhandled webhook event: ${gateway} - ${eventType}`);
        }
    }
    async handleStripeEvent(eventType, payload) {
        const paymentIntent = payload;
        const objectData = paymentIntent.data?.object;
        if (eventType === 'checkout.session.completed' || eventType === 'payment_intent.succeeded') {
            const transaction = await this.transactionsService.findByExternalId(objectData?.id || '', types_1.GatewayType.STRIPE);
            if (transaction) {
                await this.transactionsService.updateStatus(transaction.id, types_1.TransactionStatus.COMPLETED, payload);
            }
        }
        else if (eventType === 'payment_intent.payment_failed') {
            const transaction = await this.transactionsService.findByExternalId(objectData?.id || '', types_1.GatewayType.STRIPE);
            if (transaction) {
                await this.transactionsService.updateStatus(transaction.id, types_1.TransactionStatus.FAILED, payload);
            }
        }
    }
    async handlePayPalEvent(eventType, payload) {
        const resource = payload.resource;
        if (eventType === 'CHECKOUT.ORDER.APPROVED' || eventType === 'PAYMENT.CAPTURE.COMPLETED') {
            const transaction = await this.transactionsService.findByExternalId(resource?.id || '', types_1.GatewayType.PAYPAL);
            if (transaction) {
                await this.transactionsService.updateStatus(transaction.id, types_1.TransactionStatus.COMPLETED, payload);
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
                await this.transactionsService.updateStatus(transaction.id, types_1.TransactionStatus.COMPLETED, payload);
            }
        }
    }
    async handleBkashEvent(eventType, payload) {
        const paymentId = payload.payment_id;
        const status = payload.status;
        if (status === 'success' && paymentId) {
            const transaction = await this.transactionsService.findByExternalId(paymentId, types_1.GatewayType.BKASH);
            if (transaction) {
                await this.transactionsService.updateStatus(transaction.id, types_1.TransactionStatus.COMPLETED, payload);
            }
        }
    }
    async retryWebhook(eventId) {
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
        }
        catch (error) {
            event.retryCount += 1;
            event.errorMessage = error instanceof Error ? error.message : 'Unknown error';
            await this.webhookEventRepository.save(event);
            return { success: false, message: event.errorMessage };
        }
    }
    async processFailedWebhooks() {
        const failedEvents = await this.webhookEventRepository.find({
            where: { processed: false },
            order: { createdAt: 'ASC' },
            take: 100,
        });
        for (const event of failedEvents) {
            if (event.retryCount < this.MAX_RETRIES) {
                const delay = retry_util_1.RetryUtil.calculateBackoff(event.retryCount + 1);
                await new Promise((resolve) => setTimeout(resolve, delay));
                await this.retryWebhook(event.id);
            }
        }
    }
    async findAll(page = 1, limit = 20) {
        const [data, total] = await this.webhookEventRepository.findAndCount({
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total };
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
        transactions_service_1.TransactionsService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map