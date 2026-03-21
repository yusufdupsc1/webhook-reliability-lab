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
var PaystackGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaystackGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const types_1 = require("../../common/types");
let PaystackGateway = PaystackGateway_1 = class PaystackGateway {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PaystackGateway_1.name);
        this.type = types_1.GatewayType.PAYSTACK;
        this.name = 'Paystack (Africa)';
        this.baseUrl = 'https://api.paystack.co';
        this.secretKey = this.configService.get('PAYSTACK_SECRET_KEY') || '';
    }
    async createPayment(amount, currency, customer, idempotencyKey, metadata, returnUrl) {
        try {
            const baseUrl = this.configService.get('APP_URL') || 'http://localhost:3000';
            const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.secretKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: (amount * 100).toString(),
                    email: customer.email,
                    reference: idempotencyKey,
                    callback_url: returnUrl || `${baseUrl}/webhooks/paystack`,
                    metadata: { phone: customer.phone, ...metadata },
                }),
            });
            const data = await response.json();
            return {
                success: data.status,
                transactionId: data.data?.reference || idempotencyKey,
                externalId: data.data?.reference || idempotencyKey,
                gateway: this.type,
                gatewayResponse: data,
                paymentUrl: data.data?.authorization_url,
                status: data.status ? types_1.TransactionStatus.PENDING : types_1.TransactionStatus.FAILED,
            };
        }
        catch (error) {
            this.logger.error(`Paystack payment failed: ${error}`);
            return { success: false, gateway: this.type, status: types_1.TransactionStatus.FAILED, message: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async verifyWebhook(payload, headers) {
        const payloadObj = typeof payload === 'string' ? JSON.parse(payload) : payload;
        return {
            valid: true,
            eventId: payloadObj.reference,
            eventType: payloadObj.event || 'charge.success',
            payload,
        };
    }
    async createRefund(transactionExternalId, amount, reason) {
        return { success: false, status: types_1.RefundStatus.FAILED, message: 'Paystack refund not implemented' };
    }
    async getPaymentStatus(externalId) {
        return { success: false, gateway: this.type, status: types_1.TransactionStatus.PENDING };
    }
    mapStatus(gatewayStatus) {
        return gatewayStatus === 'success' ? types_1.TransactionStatus.COMPLETED : types_1.TransactionStatus.PENDING;
    }
};
exports.PaystackGateway = PaystackGateway;
exports.PaystackGateway = PaystackGateway = PaystackGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PaystackGateway);
//# sourceMappingURL=paystack.gateway.js.map