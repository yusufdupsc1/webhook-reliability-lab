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
var PayPalGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayPalGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const types_1 = require("../../common/types");
const crypto = __importStar(require("crypto"));
let PayPalGateway = PayPalGateway_1 = class PayPalGateway {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PayPalGateway_1.name);
        this.type = types_1.GatewayType.PAYPAL;
        this.name = 'PayPal';
        this.accessToken = null;
        this.tokenExpiry = null;
        this.clientId = this.configService.get('PAYPAL_CLIENT_ID') || '';
        this.clientSecret = this.configService.get('PAYPAL_CLIENT_SECRET') || '';
        this.environment = this.configService.get('PAYPAL_ENVIRONMENT') || 'sandbox';
        this.baseUrl = this.environment === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';
    }
    async getAccessToken() {
        if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
            return this.accessToken;
        }
        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        });
        if (!response.ok) {
            throw new Error(`PayPal auth failed: ${response.statusText}`);
        }
        const data = await response.json();
        this.accessToken = data.access_token;
        this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000 - 60000);
        return this.accessToken;
    }
    async createPayment(amount, currency, customer, idempotencyKey, metadata, returnUrl) {
        try {
            const token = await this.getAccessToken();
            const baseUrl = this.configService.get('APP_URL') || 'http://localhost:3000';
            const orderPayload = {
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            currency_code: currency,
                            value: amount.toFixed(2),
                        },
                        description: metadata?.description || 'Payment',
                        custom_id: idempotencyKey,
                    },
                ],
                payment_source: {
                    paypal: {
                        experience_context: {
                            payment_method_selected: 'PAYPAL',
                            return_url: returnUrl || `${baseUrl}/success`,
                            cancel_url: returnUrl || `${baseUrl}/cancel`,
                        },
                    },
                },
            };
            const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'PayPal-Request-Id': idempotencyKey,
                },
                body: JSON.stringify(orderPayload),
            });
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`PayPal order creation failed: ${error}`);
            }
            const order = await response.json();
            const approvalLink = order.links?.find((link) => link.rel === 'approve');
            return {
                success: true,
                transactionId: order.id,
                externalId: order.id,
                gateway: this.type,
                gatewayResponse: order,
                paymentUrl: approvalLink?.href,
                status: types_1.TransactionStatus.PENDING,
            };
        }
        catch (error) {
            this.logger.error(`PayPal payment creation failed: ${error}`);
            return {
                success: false,
                gateway: this.type,
                status: types_1.TransactionStatus.FAILED,
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async verifyWebhook(payload, headers) {
        try {
            const transmissionId = headers['paypal-transmission-id'];
            const transmissionTime = headers['paypal-transmission-time'];
            const certUrl = headers['paypal-cert-url'];
            const authAlgo = headers['paypal-auth-algo'];
            const transmissionSig = headers['paypal-transmission-sig'];
            const webhookId = this.configService.get('PAYPAL_WEBHOOK_ID');
            if (!transmissionId || !transmissionTime || !authAlgo || !transmissionSig || !webhookId) {
                return { valid: false, error: 'Missing PayPal webhook headers' };
            }
            const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
            const hash = crypto.createHash('sha256').update(payloadString).digest('base64');
            return {
                valid: true,
                eventId: transmissionId,
                eventType: payload?.event_type || 'unknown',
                payload,
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
            const token = await this.getAccessToken();
            const response = await fetch(`${this.baseUrl}/v2/payments/captures/${transactionExternalId}/refund`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: {
                        value: amount.toFixed(2),
                        currency_code: 'USD',
                    },
                }),
            });
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`PayPal refund failed: ${error}`);
            }
            const refund = await response.json();
            return {
                success: true,
                refundId: refund.id,
                externalRefundId: refund.id,
                status: refund.status === 'COMPLETED' ? types_1.RefundStatus.COMPLETED : types_1.RefundStatus.PENDING,
            };
        }
        catch (error) {
            this.logger.error(`PayPal refund failed: ${error}`);
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
            const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${externalId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to get PayPal order: ${response.statusText}`);
            }
            const order = await response.json();
            return {
                success: order.status === 'COMPLETED',
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
            CREATED: types_1.TransactionStatus.PENDING,
            SAVED: types_1.TransactionStatus.PENDING,
            APPROVED: types_1.TransactionStatus.PENDING,
            VOIDED: types_1.TransactionStatus.FAILED,
            COMPLETED: types_1.TransactionStatus.COMPLETED,
        };
        return statusMap[gatewayStatus] || types_1.TransactionStatus.PENDING;
    }
};
exports.PayPalGateway = PayPalGateway;
exports.PayPalGateway = PayPalGateway = PayPalGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PayPalGateway);
//# sourceMappingURL=paypal.gateway.js.map