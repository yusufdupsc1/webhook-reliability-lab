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
var BkashGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BkashGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const types_1 = require("../../common/types");
let BkashGateway = BkashGateway_1 = class BkashGateway {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(BkashGateway_1.name);
        this.type = types_1.GatewayType.BKASH;
        this.name = 'bKash (Bangladesh)';
        this.accessToken = null;
        this.apiKey = this.configService.get('BKASH_API_KEY') || '';
        this.apiSecret = this.configService.get('BKASH_API_SECRET') || '';
        this.merchantId = this.configService.get('BKASH_MERCHANT_ID') || '';
        this.username = this.configService.get('BKASH_USERNAME') || '';
        this.password = this.configService.get('BKASH_PASSWORD') || '';
        this.baseUrl = this.configService.get('BKASH_BASE_URL') || 'https://checkout.sandbox.bka.sh/v1.2.0-beta';
    }
    async getAccessToken() {
        if (this.accessToken)
            return this.accessToken;
        const response = await fetch(`${this.baseUrl}/checkout/token/grant`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                app_key: this.apiKey,
                app_secret: this.apiSecret,
            }),
        });
        if (!response.ok) {
            throw new Error(`bKash auth failed: ${response.statusText}`);
        }
        const data = await response.json();
        this.accessToken = data.id_token;
        return this.accessToken;
    }
    async createPayment(amount, currency, customer, idempotencyKey, metadata, returnUrl) {
        try {
            const token = await this.getAccessToken();
            const baseUrl = this.configService.get('APP_URL') || 'http://localhost:3000';
            const response = await fetch(`${this.baseUrl}/checkout/payment/create`, {
                method: 'POST',
                headers: {
                    Authorization: token,
                    'Content-Type': 'application/json',
                    'x-app-key': this.apiKey,
                },
                body: JSON.stringify({
                    amount: amount.toString(),
                    currency: currency || 'BDT',
                    intent: 'sale',
                    merchantInvoiceNumber: idempotencyKey,
                    merchantAssociationPayload: JSON.stringify({ idempotencyKey, ...metadata }),
                    callbackURL: returnUrl || `${baseUrl}/webhooks/bkash`,
                }),
            });
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`bKash payment creation failed: ${error}`);
            }
            const payment = await response.json();
            return {
                success: payment.status === 'success',
                transactionId: payment.payment_id,
                externalId: payment.payment_id,
                gateway: this.type,
                gatewayResponse: payment,
                paymentUrl: payment.payment_url,
                status: payment.status === 'success' ? types_1.TransactionStatus.PENDING : types_1.TransactionStatus.FAILED,
                message: payment.status === 'success' ? 'bKash payment initiated' : payment.status,
            };
        }
        catch (error) {
            this.logger.error(`bKash payment creation failed: ${error}`);
            return {
                success: false,
                gateway: this.type,
                status: types_1.TransactionStatus.FAILED,
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async verifyWebhook(payload, headers) {
        const response = await this.executePaymentStatus(payload.payment_id);
        return {
            valid: response.success,
            eventId: payload.trx_id,
            eventType: payload.status,
            payload,
        };
    }
    async executePaymentStatus(paymentId) {
        try {
            const token = await this.getAccessToken();
            const response = await fetch(`${this.baseUrl}/checkout/payment/execute`, {
                method: 'POST',
                headers: {
                    Authorization: token,
                    'Content-Type': 'application/json',
                    'x-app-key': this.apiKey,
                },
                body: JSON.stringify({ payment_id: paymentId }),
            });
            const data = await response.json();
            return {
                success: data.status === 'success',
                gateway: this.type,
                status: data.status === 'success' ? types_1.TransactionStatus.COMPLETED : types_1.TransactionStatus.FAILED,
            };
        }
        catch {
            return {
                success: false,
                gateway: this.type,
                status: types_1.TransactionStatus.FAILED,
            };
        }
    }
    async createRefund(transactionExternalId, amount, reason) {
        try {
            const token = await this.getAccessToken();
            const response = await fetch(`${this.baseUrl}/checkout/payment/refund`, {
                method: 'POST',
                headers: {
                    Authorization: token,
                    'Content-Type': 'application/json',
                    'x-app-key': this.apiKey,
                },
                body: JSON.stringify({
                    payment_id: transactionExternalId,
                    amount: amount.toString(),
                    trx_id: transactionExternalId,
                    reason: reason || 'Customer requested refund',
                }),
            });
            const refund = await response.json();
            return {
                success: refund.status === 'success',
                refundId: refund.refund_trx_id,
                externalRefundId: refund.refund_trx_id,
                status: refund.status === 'success' ? types_1.RefundStatus.COMPLETED : types_1.RefundStatus.FAILED,
            };
        }
        catch (error) {
            this.logger.error(`bKash refund failed: ${error}`);
            return {
                success: false,
                status: types_1.RefundStatus.FAILED,
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async getPaymentStatus(externalId) {
        return this.executePaymentStatus(externalId);
    }
    mapStatus(gatewayStatus) {
        const statusMap = {
            success: types_1.TransactionStatus.COMPLETED,
            pending: types_1.TransactionStatus.PENDING,
            failed: types_1.TransactionStatus.FAILED,
        };
        return statusMap[gatewayStatus.toLowerCase()] || types_1.TransactionStatus.PENDING;
    }
};
exports.BkashGateway = BkashGateway;
exports.BkashGateway = BkashGateway = BkashGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], BkashGateway);
//# sourceMappingURL=bkash.gateway.js.map