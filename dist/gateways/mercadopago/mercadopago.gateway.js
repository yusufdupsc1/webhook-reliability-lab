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
var MercadopagoGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MercadopagoGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const types_1 = require("../../common/types");
let MercadopagoGateway = MercadopagoGateway_1 = class MercadopagoGateway {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(MercadopagoGateway_1.name);
        this.type = types_1.GatewayType.MERCADOPAGO;
        this.name = 'Mercado Pago (Latin America)';
        this.baseUrl = 'https://api.mercadopago.com';
        this.accessToken = this.configService.get('MERCADOPAGO_ACCESS_TOKEN') || '';
    }
    async createPayment(amount, currency, customer, idempotencyKey, metadata, returnUrl) {
        try {
            const baseUrl = this.configService.get('APP_URL') || 'http://localhost:3000';
            const response = await fetch(`${this.baseUrl}/v1/payments`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    transaction_amount: amount,
                    description: metadata?.description || 'Payment',
                    payment_method_id: 'pix',
                    payer: { email: customer.email },
                    external_reference: idempotencyKey,
                }),
            });
            const data = await response.json();
            return {
                success: data.status === 'pending' || data.status === 'approved',
                transactionId: String(data.id),
                externalId: String(data.id),
                gateway: this.type,
                gatewayResponse: data,
                status: data.status === 'approved' ? types_1.TransactionStatus.COMPLETED : types_1.TransactionStatus.PENDING,
            };
        }
        catch (error) {
            this.logger.error(`Mercadopago payment failed: ${error}`);
            return { success: false, gateway: this.type, status: types_1.TransactionStatus.FAILED, message: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async verifyWebhook(payload, headers) {
        const payloadObj = typeof payload === 'string' ? JSON.parse(payload) : payload;
        const data = payloadObj.data;
        return { valid: true, eventId: data?.id || '', eventType: payloadObj.type || '', payload };
    }
    async createRefund(transactionExternalId, amount, reason) {
        return { success: false, status: types_1.RefundStatus.FAILED, message: 'Mercadopago refund not implemented' };
    }
    async getPaymentStatus(externalId) {
        return { success: false, gateway: this.type, status: types_1.TransactionStatus.PENDING };
    }
    mapStatus(gatewayStatus) {
        return gatewayStatus === 'approved' ? types_1.TransactionStatus.COMPLETED : types_1.TransactionStatus.PENDING;
    }
};
exports.MercadopagoGateway = MercadopagoGateway;
exports.MercadopagoGateway = MercadopagoGateway = MercadopagoGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MercadopagoGateway);
//# sourceMappingURL=mercadopago.gateway.js.map