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
var SquareGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SquareGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const types_1 = require("../../common/types");
let SquareGateway = SquareGateway_1 = class SquareGateway {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(SquareGateway_1.name);
        this.type = types_1.GatewayType.SQUARE;
        this.name = 'Square (US/Canada)';
        this.baseUrl = 'https://connect.squareup.com/v2';
        this.accessToken = this.configService.get('SQUARE_ACCESS_TOKEN') || '';
        this.locationId = this.configService.get('SQUARE_LOCATION_ID') || '';
    }
    async createPayment(amount, currency, customer, idempotencyKey, metadata, returnUrl) {
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
            const data = await response.json();
            return {
                success: data.payment?.status === 'COMPLETED',
                transactionId: data.payment?.id || idempotencyKey,
                externalId: data.payment?.id || idempotencyKey,
                gateway: this.type,
                gatewayResponse: data,
                status: data.payment?.status === 'COMPLETED' ? types_1.TransactionStatus.COMPLETED : types_1.TransactionStatus.PENDING,
            };
        }
        catch (error) {
            this.logger.error(`Square payment failed: ${error}`);
            return { success: false, gateway: this.type, status: types_1.TransactionStatus.FAILED, message: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async verifyWebhook(payload, headers) {
        return { valid: true, eventId: payload?.payment_id, eventType: payload?.type, payload };
    }
    async createRefund(transactionExternalId, amount, reason) {
        return { success: false, status: types_1.RefundStatus.FAILED, message: 'Square refund not implemented' };
    }
    async getPaymentStatus(externalId) {
        return { success: false, gateway: this.type, status: types_1.TransactionStatus.PENDING };
    }
    mapStatus(gatewayStatus) {
        return gatewayStatus === 'COMPLETED' ? types_1.TransactionStatus.COMPLETED : types_1.TransactionStatus.PENDING;
    }
};
exports.SquareGateway = SquareGateway;
exports.SquareGateway = SquareGateway = SquareGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SquareGateway);
//# sourceMappingURL=square.gateway.js.map