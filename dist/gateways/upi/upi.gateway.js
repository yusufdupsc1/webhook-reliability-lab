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
var UpiGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpiGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const types_1 = require("../../common/types");
let UpiGateway = UpiGateway_1 = class UpiGateway {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(UpiGateway_1.name);
        this.type = types_1.GatewayType.UPI;
        this.name = 'UPI (India)';
    }
    async createPayment(amount, currency, customer, idempotencyKey, metadata, returnUrl) {
        this.logger.warn('UPI gateway - payment creation not fully implemented');
        return { success: false, gateway: this.type, status: types_1.TransactionStatus.FAILED, message: 'UPI not implemented' };
    }
    async verifyWebhook(payload, headers) {
        return { valid: true, eventId: payload?.transactionId, eventType: payload?.status, payload };
    }
    async createRefund(transactionExternalId, amount, reason) {
        return { success: false, status: types_1.RefundStatus.FAILED, message: 'UPI refund not implemented' };
    }
    async getPaymentStatus(externalId) {
        return { success: false, gateway: this.type, status: types_1.TransactionStatus.PENDING };
    }
    mapStatus(gatewayStatus) {
        return gatewayStatus === 'SUCCESS' ? types_1.TransactionStatus.COMPLETED : types_1.TransactionStatus.PENDING;
    }
};
exports.UpiGateway = UpiGateway;
exports.UpiGateway = UpiGateway = UpiGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UpiGateway);
//# sourceMappingURL=upi.gateway.js.map