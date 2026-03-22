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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const webhooks_service_1 = require("./webhooks.service");
const types_1 = require("../../common/types");
let WebhooksController = class WebhooksController {
    constructor(webhooksService) {
        this.webhooksService = webhooksService;
    }
    async handleStripeWebhook(body, signature, request) {
        if (!signature) {
            throw new common_1.BadRequestException('Missing stripe-signature header');
        }
        const rawBody = typeof body === 'string' ? body : JSON.stringify(body);
        const result = await this.webhooksService.processWebhook({
            gateway: types_1.GatewayType.STRIPE,
            payload: rawBody,
            headers: request.headers,
        });
        return { received: result.success };
    }
    async handlePayPalWebhook(body, request) {
        const result = await this.webhooksService.processWebhook({
            gateway: types_1.GatewayType.PAYPAL,
            payload: body,
            headers: request.headers,
        });
        return { received: result.success };
    }
    async handleRazorpayWebhook(body, signature, request) {
        if (!signature) {
            throw new common_1.BadRequestException('Missing x-razorpay-signature header');
        }
        const result = await this.webhooksService.processWebhook({
            gateway: types_1.GatewayType.RAZORPAY,
            payload: body,
            headers: request.headers,
        });
        return { received: result.success };
    }
    async handleBkashWebhook(body, request) {
        const result = await this.webhooksService.processWebhook({
            gateway: types_1.GatewayType.BKASH,
            payload: body,
            headers: request.headers,
        });
        return { received: result.success };
    }
    async handleNagadWebhook(body, request) {
        const result = await this.webhooksService.processWebhook({
            gateway: types_1.GatewayType.NAGAD,
            payload: body,
            headers: request.headers,
        });
        return { received: result.success };
    }
    async replayWebhook(id, body) {
        return this.webhooksService.replayWebhook(id, body?.reason);
    }
    async handleGenericWebhook(gateway, body, request) {
        const result = await this.webhooksService.processWebhook({
            gateway,
            payload: body,
            headers: request.headers,
        });
        return { received: result.success };
    }
    async listWebhooks(page, limit, gateway, status, signatureStatus, replayable) {
        return this.webhooksService.findAll(page || 1, limit || 20, {
            gateway,
            status,
            signatureStatus,
            replayable,
        });
    }
    async getWebhook(id) {
        const event = await this.webhooksService.findOne(id);
        if (!event) {
            throw new common_1.NotFoundException(`Webhook event ${id} not found`);
        }
        return event;
    }
    async retryWebhook(id) {
        return this.webhooksService.retryWebhook(id);
    }
};
exports.WebhooksController = WebhooksController;
__decorate([
    (0, common_1.Post)('stripe'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Stripe webhooks' }),
    (0, swagger_1.ApiHeader)({ name: 'stripe-signature', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "handleStripeWebhook", null);
__decorate([
    (0, common_1.Post)('paypal'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle PayPal webhooks' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "handlePayPalWebhook", null);
__decorate([
    (0, common_1.Post)('razorpay'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Razorpay webhooks' }),
    (0, swagger_1.ApiHeader)({ name: 'x-razorpay-signature', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-razorpay-signature')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "handleRazorpayWebhook", null);
__decorate([
    (0, common_1.Post)('bkash'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle bKash webhooks' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "handleBkashWebhook", null);
__decorate([
    (0, common_1.Post)('nagad'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Nagad webhooks' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "handleNagadWebhook", null);
__decorate([
    (0, common_1.Post)('admin/:id/replay'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Replay a stored webhook event' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Webhook event ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Replay result' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "replayWebhook", null);
__decorate([
    (0, common_1.Post)(':gateway'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle generic gateway webhook' }),
    (0, swagger_1.ApiParam)({ name: 'gateway', enum: types_1.GatewayType }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed' }),
    __param(0, (0, common_1.Param)('gateway')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "handleGenericWebhook", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List webhook events' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of webhook events' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'gateway', required: false, enum: types_1.GatewayType }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: types_1.WebhookProcessingStatus }),
    (0, swagger_1.ApiQuery)({ name: 'signatureStatus', required: false, enum: types_1.WebhookSignatureStatus }),
    (0, swagger_1.ApiQuery)({ name: 'replayable', required: false, type: Boolean }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('gateway')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('signatureStatus')),
    __param(5, (0, common_1.Query)('replayable')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, Boolean]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "listWebhooks", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get stored webhook event details' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Webhook event ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook event details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Webhook event not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "getWebhook", null);
__decorate([
    (0, common_1.Post)('retry/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Retry a failed webhook' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Webhook event ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Retry result' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "retryWebhook", null);
exports.WebhooksController = WebhooksController = __decorate([
    (0, swagger_1.ApiTags)('webhooks'),
    (0, common_1.Controller)('webhooks'),
    __metadata("design:paramtypes", [webhooks_service_1.WebhooksService])
], WebhooksController);
//# sourceMappingURL=webhooks.controller.js.map