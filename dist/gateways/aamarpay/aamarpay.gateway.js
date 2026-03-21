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
var AamarpayGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AamarpayGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const types_1 = require("../../common/types");
let AamarpayGateway = AamarpayGateway_1 = class AamarpayGateway {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(AamarpayGateway_1.name);
        this.type = types_1.GatewayType.AAMARPAY;
        this.name = 'Aamarpay (Bangladesh)';
        this.storeId = this.configService.get('AAMARPAY_STORE_ID') || '';
        this.signatureKey = this.configService.get('AAMARPAY_SIGNATURE_KEY') || '';
        this.baseUrl = this.configService.get('AAMARPAY_BASE_URL') || 'https://sandbox.aamarpay.com';
    }
    async createPayment(amount, currency, customer, idempotencyKey, metadata, returnUrl) {
        try {
            const baseUrl = this.configService.get('APP_URL') || 'http://localhost:3000';
            const response = await fetch(`${this.baseUrl}/post`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    store_id: this.storeId,
                    signature_key: this.signatureKey,
                    amount: amount.toString(),
                    currency: currency || 'BDT',
                    tran_id: idempotencyKey,
                    success_url: returnUrl || `${baseUrl}/webhooks/aamarpay`,
                    fail_url: returnUrl || `${baseUrl}/webhooks/aamarpay`,
                    customer_email: customer.email,
                    customer_mobile: customer.phone,
                }),
            });
            const data = await response.json();
            return {
                success: data.status === 'success',
                transactionId: idempotencyKey,
                externalId: idempotencyKey,
                gateway: this.type,
                gatewayResponse: data,
                paymentUrl: data.payment_url,
                status: data.status === 'success' ? types_1.TransactionStatus.PENDING : types_1.TransactionStatus.FAILED,
            };
        }
        catch (error) {
            this.logger.error(`Aamarpay payment failed: ${error}`);
            return {
                success: false,
                gateway: this.type,
                status: types_1.TransactionStatus.FAILED,
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async verifyWebhook(payload, headers) {
        const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
        return {
            valid: true,
            eventId: data.tran_id,
            eventType: data.status,
            payload,
        };
    }
    async createRefund(transactionExternalId, amount, reason) {
        return { success: false, status: types_1.RefundStatus.FAILED, message: 'Aamarpay refund not implemented' };
    }
    async getPaymentStatus(externalId) {
        return { success: false, gateway: this.type, status: types_1.TransactionStatus.PENDING };
    }
    mapStatus(gatewayStatus) {
        return gatewayStatus === 'success' ? types_1.TransactionStatus.COMPLETED : types_1.TransactionStatus.PENDING;
    }
};
exports.AamarpayGateway = AamarpayGateway;
exports.AamarpayGateway = AamarpayGateway = AamarpayGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AamarpayGateway);
//# sourceMappingURL=aamarpay.gateway.js.map