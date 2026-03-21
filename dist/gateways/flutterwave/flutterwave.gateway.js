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
var FlutterwaveGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlutterwaveGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const types_1 = require("../../common/types");
let FlutterwaveGateway = FlutterwaveGateway_1 = class FlutterwaveGateway {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(FlutterwaveGateway_1.name);
        this.type = types_1.GatewayType.FLUTTERWAVE;
        this.name = 'Flutterwave (Africa)';
        this.baseUrl = 'https://api.flutterwave.com/v3';
        this.publicKey = this.configService.get('FLUTTERWAVE_PUBLIC_KEY') || '';
        this.secretKey = this.configService.get('FLUTTERWAVE_SECRET_KEY') || '';
    }
    async createPayment(amount, currency, customer, idempotencyKey, metadata, returnUrl) {
        try {
            const baseUrl = this.configService.get('APP_URL') || 'http://localhost:3000';
            const response = await fetch(`${this.baseUrl}/payments`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.secretKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tx_ref: idempotencyKey,
                    amount: amount.toString(),
                    currency: currency || 'USD',
                    redirect_url: returnUrl || `${baseUrl}/webhooks/flutterwave`,
                    customer: { email: customer.email, phonenumber: customer.phone, name: customer.name },
                    meta: metadata,
                }),
            });
            const data = await response.json();
            return {
                success: data.status === 'success',
                transactionId: data.data?.id?.toString() || idempotencyKey,
                externalId: data.data?.id?.toString() || idempotencyKey,
                gateway: this.type,
                gatewayResponse: data,
                paymentUrl: data.data?.link,
                status: data.status === 'success' ? types_1.TransactionStatus.PENDING : types_1.TransactionStatus.FAILED,
            };
        }
        catch (error) {
            this.logger.error(`Flutterwave payment failed: ${error}`);
            return { success: false, gateway: this.type, status: types_1.TransactionStatus.FAILED, message: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async verifyWebhook(payload, headers) {
        return { valid: true, eventId: payload.tx_ref, eventType: payload.status, payload };
    }
    async createRefund(transactionExternalId, amount, reason) {
        return { success: false, status: types_1.RefundStatus.FAILED, message: 'Flutterwave refund not implemented' };
    }
    async getPaymentStatus(externalId) {
        return { success: false, gateway: this.type, status: types_1.TransactionStatus.PENDING };
    }
    mapStatus(gatewayStatus) {
        return gatewayStatus === 'successful' ? types_1.TransactionStatus.COMPLETED : types_1.TransactionStatus.PENDING;
    }
};
exports.FlutterwaveGateway = FlutterwaveGateway;
exports.FlutterwaveGateway = FlutterwaveGateway = FlutterwaveGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FlutterwaveGateway);
//# sourceMappingURL=flutterwave.gateway.js.map