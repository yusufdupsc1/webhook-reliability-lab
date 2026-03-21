"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayModule = void 0;
const common_1 = require("@nestjs/common");
const stripe_gateway_1 = require("./stripe/stripe.gateway");
const paypal_gateway_1 = require("./paypal/paypal.gateway");
const bkash_gateway_1 = require("./bkash/bkash.gateway");
const nagad_gateway_1 = require("./nagad/nagad.gateway");
const razorpay_gateway_1 = require("./razorpay/razorpay.gateway");
const sslcommerz_gateway_1 = require("./sslcommerz/sslcommerz.gateway");
const aamarpay_gateway_1 = require("./aamarpay/aamarpay.gateway");
const paytm_gateway_1 = require("./paytm/paytm.gateway");
const phonepe_gateway_1 = require("./phonepe/phonepe.gateway");
const upi_gateway_1 = require("./upi/upi.gateway");
const mercadopago_gateway_1 = require("./mercadopago/mercadopago.gateway");
const flutterwave_gateway_1 = require("./flutterwave/flutterwave.gateway");
const paystack_gateway_1 = require("./paystack/paystack.gateway");
const square_gateway_1 = require("./square/square.gateway");
const adyen_gateway_1 = require("./adyen/adyen.gateway");
const gateway_service_1 = require("./gateway.service");
const GATEWAY_PROVIDERS = [
    stripe_gateway_1.StripeGateway,
    paypal_gateway_1.PayPalGateway,
    bkash_gateway_1.BkashGateway,
    nagad_gateway_1.NagadGateway,
    razorpay_gateway_1.RazorpayGateway,
    sslcommerz_gateway_1.SslCommerzGateway,
    aamarpay_gateway_1.AamarpayGateway,
    paytm_gateway_1.PaytmGateway,
    phonepe_gateway_1.PhonePeGateway,
    upi_gateway_1.UpiGateway,
    mercadopago_gateway_1.MercadopagoGateway,
    flutterwave_gateway_1.FlutterwaveGateway,
    paystack_gateway_1.PaystackGateway,
    square_gateway_1.SquareGateway,
    adyen_gateway_1.AdyenGateway,
];
let GatewayModule = class GatewayModule {
};
exports.GatewayModule = GatewayModule;
exports.GatewayModule = GatewayModule = __decorate([
    (0, common_1.Module)({
        providers: [...GATEWAY_PROVIDERS, gateway_service_1.GatewayService],
        exports: [...GATEWAY_PROVIDERS, gateway_service_1.GatewayService],
    })
], GatewayModule);
//# sourceMappingURL=gateway.module.js.map