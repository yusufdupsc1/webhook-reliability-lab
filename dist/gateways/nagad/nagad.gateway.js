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
var NagadGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NagadGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const types_1 = require("../../common/types");
let NagadGateway = NagadGateway_1 = class NagadGateway {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(NagadGateway_1.name);
        this.type = types_1.GatewayType.NAGAD;
        this.name = 'Nagad (Bangladesh)';
        this.accessToken = null;
        this.tokenExpiry = null;
        this.merchantId = this.configService.get('NAGAD_MERCHANT_ID') || '';
        this.merchantKey = this.configService.get('NAGAD_MERCHANT_KEY') || '';
        this.baseUrl = this.configService.get('NAGAD_BASE_URL') || 'https://sandbox.mynagad.com';
    }
    async getAccessToken() {
        if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
            return this.accessToken;
        }
        const response = await fetch(`${this.baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: this.configService.get('NAGAD_USERNAME'),
                password: this.configService.get('NAGAD_PASSWORD'),
            }),
        });
        if (!response.ok) {
            throw new Error(`Nagad auth failed: ${response.statusText}`);
        }
        const data = await response.json();
        this.accessToken = data.access_token;
        this.tokenExpiry = new Date(data.expires_at);
        return this.accessToken;
    }
    async createPayment(amount, currency, customer, idempotencyKey, metadata, returnUrl) {
        try {
            const token = await this.getAccessToken();
            const baseUrl = this.configService.get('APP_URL') || 'http://localhost:3000';
            const dateTime = new Date().toISOString();
            const response = await fetch(`${this.baseUrl}/api/auth/checkout/initialize`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-KM-IP-V4': '127.0.0.1',
                    'X-KM-Api-Key': this.merchantKey,
                    'X-KM-Client-Id': this.merchantId,
                    'X-KM-Request-Timestamp': dateTime,
                },
                body: JSON.stringify({
                    amount: amount.toString(),
                    currency: currency || 'BDT',
                    orderId: idempotencyKey,
                    additionalData: JSON.stringify(metadata),
                    callbackUrl: returnUrl || `${baseUrl}/webhooks/nagad`,
                    merchantId: this.merchantId,
                }),
            });
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Nagad payment creation failed: ${error}`);
            }
            const payment = await response.json();
            return {
                success: payment.status === 'success',
                transactionId: payment.paymentReferenceId,
                externalId: payment.paymentReferenceId,
                gateway: this.type,
                gatewayResponse: payment,
                paymentUrl: payment.paymentUrl,
                status: payment.status === 'success' ? types_1.TransactionStatus.PENDING : types_1.TransactionStatus.FAILED,
            };
        }
        catch (error) {
            this.logger.error(`Nagad payment creation failed: ${error}`);
            return {
                success: false,
                gateway: this.type,
                status: types_1.TransactionStatus.FAILED,
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async verifyWebhook(payload, headers) {
        return {
            valid: true,
            eventId: payload.paymentRefId,
            eventType: payload.status,
            payload,
        };
    }
    async createRefund(transactionExternalId, amount, reason) {
        try {
            const token = await this.getAccessToken();
            const response = await fetch(`${this.baseUrl}/api/auth/checkout/refund`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-KM-IP-V4': '127.0.0.1',
                    'X-KM-Api-Key': this.merchantKey,
                },
                body: JSON.stringify({
                    paymentRefId: transactionExternalId,
                    amount: amount.toString(),
                    reason: reason || 'Customer requested refund',
                }),
            });
            const refund = await response.json();
            return {
                success: refund.status === 'success',
                refundId: refund.refundRefId,
                externalRefundId: refund.refundRefId,
                status: refund.status === 'success' ? types_1.RefundStatus.COMPLETED : types_1.RefundStatus.FAILED,
            };
        }
        catch (error) {
            this.logger.error(`Nagad refund failed: ${error}`);
            return {
                success: false,
                status: types_1.RefundStatus.FAILED,
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async getPaymentStatus(externalId) {
        try {
            const token = await this.getAccessToken();
            const response = await fetch(`${this.baseUrl}/api/auth/checkout/payment/verify/${externalId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'X-KM-IP-V4': '127.0.0.1',
                    'X-KM-Api-Key': this.merchantKey,
                },
            });
            const data = await response.json();
            return {
                success: data.status === 'success',
                externalId,
                gateway: this.type,
                status: this.mapStatus(data.status),
            };
        }
        catch (error) {
            return {
                success: false,
                gateway: this.type,
                status: types_1.TransactionStatus.FAILED,
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
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
exports.NagadGateway = NagadGateway;
exports.NagadGateway = NagadGateway = NagadGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NagadGateway);
//# sourceMappingURL=nagad.gateway.js.map