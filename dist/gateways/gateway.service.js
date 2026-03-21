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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayService = void 0;
const common_1 = require("@nestjs/common");
const types_1 = require("../common/types");
const stripe_gateway_1 = require("./stripe/stripe.gateway");
const paypal_gateway_1 = require("./paypal/paypal.gateway");
const bkash_gateway_1 = require("./bkash/bkash.gateway");
const nagad_gateway_1 = require("./nagad/nagad.gateway");
const razorpay_gateway_1 = require("./razorpay/razorpay.gateway");
const mercadopago_gateway_1 = require("./mercadopago/mercadopago.gateway");
const flutterwave_gateway_1 = require("./flutterwave/flutterwave.gateway");
const paystack_gateway_1 = require("./paystack/paystack.gateway");
const square_gateway_1 = require("./square/square.gateway");
const adyen_gateway_1 = require("./adyen/adyen.gateway");
let GatewayService = class GatewayService {
    constructor(stripeGateway, paypalGateway, bkashGateway, nagadGateway, razorpayGateway, mercadopagoGateway, flutterwaveGateway, paystackGateway, squareGateway, adyenGateway) {
        this.stripeGateway = stripeGateway;
        this.paypalGateway = paypalGateway;
        this.bkashGateway = bkashGateway;
        this.nagadGateway = nagadGateway;
        this.razorpayGateway = razorpayGateway;
        this.mercadopagoGateway = mercadopagoGateway;
        this.flutterwaveGateway = flutterwaveGateway;
        this.paystackGateway = paystackGateway;
        this.squareGateway = squareGateway;
        this.adyenGateway = adyenGateway;
        this.gateways = new Map();
        this.gateways.set(types_1.GatewayType.STRIPE, this.stripeGateway);
        this.gateways.set(types_1.GatewayType.PAYPAL, this.paypalGateway);
        this.gateways.set(types_1.GatewayType.BKASH, this.bkashGateway);
        this.gateways.set(types_1.GatewayType.NAGAD, this.nagadGateway);
        this.gateways.set(types_1.GatewayType.RAZORPAY, this.razorpayGateway);
        this.gateways.set(types_1.GatewayType.MERCADOPAGO, this.mercadopagoGateway);
        this.gateways.set(types_1.GatewayType.FLUTTERWAVE, this.flutterwaveGateway);
        this.gateways.set(types_1.GatewayType.PAYSTACK, this.paystackGateway);
        this.gateways.set(types_1.GatewayType.SQUARE, this.squareGateway);
        this.gateways.set(types_1.GatewayType.ADYEN, this.adyenGateway);
    }
    getGateway(type) {
        const gateway = this.gateways.get(type);
        if (!gateway) {
            throw new Error(`Gateway ${type} is not supported`);
        }
        return gateway;
    }
    async createPayment(gatewayType, amount, currency, customer, idempotencyKey, metadata, returnUrl) {
        const gateway = this.getGateway(gatewayType);
        return gateway.createPayment(amount, currency, customer, idempotencyKey, metadata, returnUrl);
    }
    async verifyWebhook(gatewayType, payload, headers) {
        const gateway = this.getGateway(gatewayType);
        return gateway.verifyWebhook(payload, headers);
    }
    async createRefund(gatewayType, transactionExternalId, amount, reason) {
        const gateway = this.getGateway(gatewayType);
        return gateway.createRefund(transactionExternalId, amount, reason);
    }
    getSupportedGateways() {
        return Array.from(this.gateways.entries()).map(([type, gateway]) => ({
            type,
            name: gateway.name,
        }));
    }
};
exports.GatewayService = GatewayService;
exports.GatewayService = GatewayService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [stripe_gateway_1.StripeGateway,
        paypal_gateway_1.PayPalGateway,
        bkash_gateway_1.BkashGateway,
        nagad_gateway_1.NagadGateway,
        razorpay_gateway_1.RazorpayGateway,
        mercadopago_gateway_1.MercadopagoGateway,
        flutterwave_gateway_1.FlutterwaveGateway,
        paystack_gateway_1.PaystackGateway,
        square_gateway_1.SquareGateway,
        adyen_gateway_1.AdyenGateway])
], GatewayService);
//# sourceMappingURL=gateway.service.js.map