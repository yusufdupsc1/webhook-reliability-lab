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
var AdyenGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdyenGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const types_1 = require("../../common/types");
let AdyenGateway = AdyenGateway_1 = class AdyenGateway {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(AdyenGateway_1.name);
        this.type = types_1.GatewayType.ADYEN;
        this.name = 'Adyen (Global)';
        this.baseUrl = 'https://checkout-test.adyen.com/v71';
        this.apiKey = this.configService.get('ADYEN_API_KEY') || '';
        this.merchantAccount = this.configService.get('ADYEN_MERCHANT_ACCOUNT') || '';
    }
    async createPayment(amount, currency, customer, idempotencyKey, metadata, returnUrl) {
        try {
            const response = await fetch(`${this.baseUrl}/payments`, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
                    'Content-Type': 'application/json',
                    'Idempotency-Key': idempotencyKey,
                },
                body: JSON.stringify({
                    amount: { value: Math.round(amount * 100), currency: currency || 'USD' },
                    reference: idempotencyKey,
                    merchantAccount: this.merchantAccount,
                    returnUrl: returnUrl || 'http://localhost:3000/webhooks/adyen',
                    shopperEmail: customer.email,
                    shopperReference: customer.phone,
                    metadata: metadata,
                }),
            });
            const data = await response.json();
            return {
                success: data.resultCode === 'Authorised' || data.resultCode === 'Pending',
                transactionId: data.pspReference || idempotencyKey,
                externalId: data.pspReference || idempotencyKey,
                gateway: this.type,
                gatewayResponse: data,
                paymentUrl: data.action?.url,
                status: data.resultCode === 'Authorised' ? types_1.TransactionStatus.COMPLETED : types_1.TransactionStatus.PENDING,
            };
        }
        catch (error) {
            this.logger.error(`Adyen payment failed: ${error}`);
            return { success: false, gateway: this.type, status: types_1.TransactionStatus.FAILED, message: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async verifyWebhook(payload, headers) {
        return { valid: true, eventId: payload?.pspReference, eventType: payload?.eventCode, payload };
    }
    async createRefund(transactionExternalId, amount, reason) {
        return { success: false, status: types_1.RefundStatus.FAILED, message: 'Adyen refund not implemented' };
    }
    async getPaymentStatus(externalId) {
        return { success: false, gateway: this.type, status: types_1.TransactionStatus.PENDING };
    }
    mapStatus(gatewayStatus) {
        return gatewayStatus === 'Authorised' ? types_1.TransactionStatus.COMPLETED : types_1.TransactionStatus.PENDING;
    }
};
exports.AdyenGateway = AdyenGateway;
exports.AdyenGateway = AdyenGateway = AdyenGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AdyenGateway);
//# sourceMappingURL=adyen.gateway.js.map