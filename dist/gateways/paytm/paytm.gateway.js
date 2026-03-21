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
var PaytmGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaytmGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const types_1 = require("../../common/types");
let PaytmGateway = PaytmGateway_1 = class PaytmGateway {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PaytmGateway_1.name);
        this.type = types_1.GatewayType.PAYTM;
        this.name = 'Paytm (India)';
    }
    async createPayment(amount, currency, customer, idempotencyKey, metadata, returnUrl) {
        this.logger.warn('Paytm gateway - payment creation not fully implemented');
        return { success: false, gateway: this.type, status: types_1.TransactionStatus.FAILED, message: 'Paytm not implemented' };
    }
    async verifyWebhook(payload, headers) {
        return { valid: true, eventId: payload.ORDERID, eventType: payload.STATUS, payload };
    }
    async createRefund(transactionExternalId, amount, reason) {
        return { success: false, status: types_1.RefundStatus.FAILED, message: 'Paytm refund not implemented' };
    }
    async getPaymentStatus(externalId) {
        return { success: false, gateway: this.type, status: types_1.TransactionStatus.PENDING };
    }
    mapStatus(gatewayStatus) {
        return gatewayStatus === 'TXN_SUCCESS' ? types_1.TransactionStatus.COMPLETED : types_1.TransactionStatus.PENDING;
    }
};
exports.PaytmGateway = PaytmGateway;
exports.PaytmGateway = PaytmGateway = PaytmGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PaytmGateway);
//# sourceMappingURL=paytm.gateway.js.map