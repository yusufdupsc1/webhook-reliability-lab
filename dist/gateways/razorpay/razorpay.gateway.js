"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RazorpayGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const types_1 = require("../../common/types");
const crypto = __importStar(require("crypto"));
let RazorpayGateway = RazorpayGateway_1 = class RazorpayGateway {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(RazorpayGateway_1.name);
        this.type = types_1.GatewayType.RAZORPAY;
        this.name = 'Razorpay (India)';
        this.keyId = this.configService.get('RAZORPAY_KEY_ID') || '';
        this.keySecret = this.configService.get('RAZORPAY_KEY_SECRET') || '';
        this.baseUrl = this.configService.get('RAZORPAY_BASE_URL') || 'https://api.razorpay.com/v1';
    }
    async createPayment(amount, currency, customer, idempotencyKey, metadata, returnUrl) {
        try {
            const baseUrl = this.configService.get('APP_URL') || 'http://localhost:3000';
            const orderPayload = {
                amount: Math.round(amount * 100),
                currency: currency || 'INR',
                receipt: idempotencyKey,
                notes: {
                    email: customer.email,
                    phone: customer.phone,
                    ...metadata,
                },
                callback_url: returnUrl || `${baseUrl}/webhooks/razorpay`,
            };
            const response = await fetch(`${this.baseUrl}/orders`, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64')}`,
                    'Content-Type': 'application/json',
                    'X-Idempotency-Key': idempotencyKey,
                },
                body: JSON.stringify(orderPayload),
            });
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Razorpay order creation failed: ${error}`);
            }
            const order = await response.json();
            return {
                success: true,
                transactionId: order.id,
                externalId: order.id,
                gateway: this.type,
                gatewayResponse: order,
                paymentUrl: order.short_url,
                status: this.mapStatus(order.status),
            };
        }
        catch (error) {
            this.logger.error(`Razorpay payment creation failed: ${error}`);
            return {
                success: false,
                gateway: this.type,
                status: types_1.TransactionStatus.FAILED,
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async verifyWebhook(payload, headers) {
        const webhookSecret = this.configService.get('RAZORPAY_WEBHOOK_SECRET');
        if (!webhookSecret) {
            return { valid: false, error: 'Webhook secret not configured' };
        }
        try {
            const signature = headers['x-razorpay-signature'];
            if (!signature) {
                return { valid: false, error: 'Missing razorpay signature' };
            }
            const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(payloadString)
                .digest('hex');
            if (signature !== expectedSignature) {
                return { valid: false, error: 'Invalid signature' };
            }
            const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
            return {
                valid: true,
                eventId: data.payload?.payment?.entity?.id || data.payload?.order?.entity?.id,
                eventType: data.event,
                payload: data.payload,
            };
        }
        catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'Verification failed',
            };
        }
    }
    async createRefund(transactionExternalId, amount, reason) {
        try {
            const response = await fetch(`${this.baseUrl}/payments/${transactionExternalId}/refund`, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: Math.round(amount * 100),
                    notes: reason ? { reason } : undefined,
                }),
            });
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Razorpay refund failed: ${error}`);
            }
            const refund = await response.json();
            return {
                success: refund.status === 'created',
                refundId: refund.id,
                externalRefundId: refund.id,
                status: refund.status === 'created' ? types_1.RefundStatus.PENDING : types_1.RefundStatus.FAILED,
            };
        }
        catch (error) {
            this.logger.error(`Razorpay refund failed: ${error}`);
            return {
                success: false,
                status: types_1.RefundStatus.FAILED,
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async getPaymentStatus(externalId) {
        try {
            const response = await fetch(`${this.baseUrl}/orders/${externalId}`, {
                headers: {
                    Authorization: `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64')}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to get Razorpay order: ${response.statusText}`);
            }
            const order = await response.json();
            return {
                success: order.status === 'paid',
                externalId: order.id,
                gateway: this.type,
                status: this.mapStatus(order.status),
                gatewayResponse: order,
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
            created: types_1.TransactionStatus.PENDING,
            pending: types_1.TransactionStatus.PENDING,
            attempted: types_1.TransactionStatus.PENDING,
            paid: types_1.TransactionStatus.COMPLETED,
            failed: types_1.TransactionStatus.FAILED,
        };
        return statusMap[gatewayStatus.toLowerCase()] || types_1.TransactionStatus.PENDING;
    }
};
exports.RazorpayGateway = RazorpayGateway;
exports.RazorpayGateway = RazorpayGateway = RazorpayGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RazorpayGateway);
//# sourceMappingURL=razorpay.gateway.js.map