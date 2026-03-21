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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var StripeGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = __importDefault(require("stripe"));
const types_1 = require("../../common/types");
let StripeGateway = StripeGateway_1 = class StripeGateway {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(StripeGateway_1.name);
        this.type = types_1.GatewayType.STRIPE;
        this.name = 'Stripe';
        const apiKey = this.configService.get('STRIPE_API_KEY');
        if (!apiKey) {
            throw new Error('STRIPE_API_KEY is not configured');
        }
        this.stripe = new stripe_1.default(apiKey, {
            apiVersion: '2023-10-16',
        });
    }
    async createPayment(amount, currency, customer, idempotencyKey, metadata, returnUrl) {
        try {
            const session = await this.stripe.checkout.sessions.create({
                mode: 'payment',
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: currency.toLowerCase(),
                            product_data: {
                                name: metadata?.description || 'Payment',
                            },
                            unit_amount: Math.round(amount * 100),
                        },
                        quantity: 1,
                    },
                ],
                customer_email: customer.email,
                metadata: {
                    idempotencyKey,
                    ...metadata,
                },
                success_url: returnUrl || `${process.env.APP_URL}/success`,
                cancel_url: returnUrl || `${process.env.APP_URL}/cancel`,
            }, {
                idempotencyKey,
            });
            return {
                success: true,
                transactionId: session.id || '',
                externalId: session.id || '',
                gateway: this.type,
                gatewayResponse: session,
                paymentUrl: session.url || undefined,
                status: types_1.TransactionStatus.PENDING,
            };
        }
        catch (error) {
            this.logger.error(`Stripe payment creation failed: ${error}`);
            return {
                success: false,
                gateway: this.type,
                status: types_1.TransactionStatus.FAILED,
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async verifyWebhook(payload, headers) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            return { valid: false, error: 'Webhook secret not configured' };
        }
        try {
            const sigHeader = headers['stripe-signature'];
            if (!sigHeader) {
                return { valid: false, error: 'Missing stripe-signature header' };
            }
            let event;
            if (typeof payload === 'string') {
                event = this.stripe.webhooks.constructEvent(payload, sigHeader, webhookSecret);
            }
            else {
                event = this.stripe.webhooks.constructEvent(JSON.stringify(payload), sigHeader, webhookSecret);
            }
            return {
                valid: true,
                eventId: event.id,
                eventType: event.type,
                payload: event.data.object,
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
            const refund = await this.stripe.refunds.create({
                payment_intent: transactionExternalId,
                amount: Math.round(amount * 100),
                reason: 'requested_by_customer',
            });
            return {
                success: true,
                refundId: refund.id,
                externalRefundId: refund.id,
                status: refund.status === 'succeeded' ? types_1.RefundStatus.COMPLETED : types_1.RefundStatus.PENDING,
            };
        }
        catch (error) {
            this.logger.error(`Stripe refund failed: ${error}`);
            return {
                success: false,
                status: types_1.RefundStatus.FAILED,
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async getPaymentStatus(externalId) {
        try {
            const session = await this.stripe.checkout.sessions.retrieve(externalId);
            return {
                success: session.payment_status === 'paid',
                externalId: session.id || externalId,
                gateway: this.type,
                status: this.mapStatus(session.status || 'unknown'),
                gatewayResponse: session,
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
            pending: types_1.TransactionStatus.PENDING,
            complete: types_1.TransactionStatus.COMPLETED,
            paid: types_1.TransactionStatus.COMPLETED,
            succeeded: types_1.TransactionStatus.COMPLETED,
            failed: types_1.TransactionStatus.FAILED,
            canceled: types_1.TransactionStatus.FAILED,
            expired: types_1.TransactionStatus.FAILED,
        };
        return statusMap[gatewayStatus.toLowerCase()] || types_1.TransactionStatus.PENDING;
    }
};
exports.StripeGateway = StripeGateway;
exports.StripeGateway = StripeGateway = StripeGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StripeGateway);
//# sourceMappingURL=stripe.gateway.js.map