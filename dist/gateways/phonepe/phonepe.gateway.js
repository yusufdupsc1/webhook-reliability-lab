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
var PhonePeGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhonePeGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const types_1 = require("../../common/types");
let PhonePeGateway = PhonePeGateway_1 = class PhonePeGateway {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PhonePeGateway_1.name);
        this.type = types_1.GatewayType.PHONEPE;
        this.name = 'PhonePe (India)';
        this.merchantId = this.configService.get('PHONEPE_MERCHANT_ID') || '';
        this.saltKey = this.configService.get('PHONEPE_SALT_KEY') || '';
        this.baseUrl = this.configService.get('PHONEPE_BASE_URL') || 'https://api-preprod.phonepe.com/apis/pg-sandbox';
    }
    async createPayment(amount, currency, customer, idempotencyKey, metadata, returnUrl) {
        this.logger.warn('PhonePe gateway - payment creation not fully implemented');
        return { success: false, gateway: this.type, status: types_1.TransactionStatus.FAILED, message: 'PhonePe not implemented' };
    }
    async verifyWebhook(payload, headers) {
        return { valid: true, eventId: payload.transactionId, eventType: payload.state, payload };
    }
    async createRefund(transactionExternalId, amount, reason) {
        return { success: false, status: types_1.RefundStatus.FAILED, message: 'PhonePe refund not implemented' };
    }
    async getPaymentStatus(externalId) {
        return { success: false, gateway: this.type, status: types_1.TransactionStatus.PENDING };
    }
    mapStatus(gatewayStatus) {
        return gatewayStatus === 'COMPLETED' ? types_1.TransactionStatus.COMPLETED : types_1.TransactionStatus.PENDING;
    }
};
exports.PhonePeGateway = PhonePeGateway;
exports.PhonePeGateway = PhonePeGateway = PhonePeGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PhonePeGateway);
//# sourceMappingURL=phonepe.gateway.js.map