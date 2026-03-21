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
var SslCommerzGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SslCommerzGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const types_1 = require("../../common/types");
let SslCommerzGateway = SslCommerzGateway_1 = class SslCommerzGateway {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(SslCommerzGateway_1.name);
        this.type = types_1.GatewayType.SSLCOMMERZ;
        this.name = 'SSLCommerz (Bangladesh)';
        this.storeId = this.configService.get('SSLCOMMERZ_STORE_ID') || '';
        this.storePassword = this.configService.get('SSLCOMMERZ_STORE_PASSWORD') || '';
        this.baseUrl = this.configService.get('SSLCOMMERZ_BASE_URL') || 'https://sandbox.sslcommerz.com';
    }
    async createPayment(amount, currency, customer, idempotencyKey, metadata, returnUrl) {
        try {
            const baseUrl = this.configService.get('APP_URL') || 'http://localhost:3000';
            const response = await fetch(`${this.baseUrl}/gw/v3/process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    store_id: this.storeId,
                    store_passwd: this.storePassword,
                    total_amount: amount,
                    currency: currency || 'BDT',
                    tran_id: idempotencyKey,
                    success_url: returnUrl || `${baseUrl}/webhooks/sslcommerz`,
                    fail_url: returnUrl || `${baseUrl}/webhooks/sslcommerz`,
                    cancel_url: returnUrl || `${baseUrl}/webhooks/sslcommerz`,
                    cus_email: customer.email,
                    cus_phone: customer.phone,
                    product_profile: 'general',
                }),
            });
            const data = await response.json();
            return {
                success: data.status === 'success',
                transactionId: data.sessionkey || idempotencyKey,
                externalId: idempotencyKey,
                gateway: this.type,
                gatewayResponse: data,
                paymentUrl: data.gatewaypage_url,
                status: data.status === 'success' ? types_1.TransactionStatus.PENDING : types_1.TransactionStatus.FAILED,
            };
        }
        catch (error) {
            this.logger.error(`SSLCommerz payment failed: ${error}`);
            return { success: false, gateway: this.type, status: types_1.TransactionStatus.FAILED, message: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async verifyWebhook(payload, headers) {
        return { valid: true, eventId: payload.tran_id, eventType: payload.status, payload };
    }
    async createRefund(transactionExternalId, amount, reason) {
        return { success: false, status: types_1.RefundStatus.FAILED, message: 'SSLCommerz refund not implemented' };
    }
    async getPaymentStatus(externalId) {
        return { success: false, gateway: this.type, status: types_1.TransactionStatus.PENDING };
    }
    mapStatus(gatewayStatus) {
        return gatewayStatus === 'success' ? types_1.TransactionStatus.COMPLETED : types_1.TransactionStatus.PENDING;
    }
};
exports.SslCommerzGateway = SslCommerzGateway;
exports.SslCommerzGateway = SslCommerzGateway = SslCommerzGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SslCommerzGateway);
//# sourceMappingURL=sslcommerz.gateway.js.map