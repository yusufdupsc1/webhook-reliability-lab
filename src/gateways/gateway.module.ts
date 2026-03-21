import { Module } from '@nestjs/common';
import { StripeGateway } from './stripe/stripe.gateway';
import { PayPalGateway } from './paypal/paypal.gateway';
import { BkashGateway } from './bkash/bkash.gateway';
import { NagadGateway } from './nagad/nagad.gateway';
import { RazorpayGateway } from './razorpay/razorpay.gateway';
import { SslCommerzGateway } from './sslcommerz/sslcommerz.gateway';
import { AamarpayGateway } from './aamarpay/aamarpay.gateway';
import { PaytmGateway } from './paytm/paytm.gateway';
import { PhonePeGateway } from './phonepe/phonepe.gateway';
import { UpiGateway } from './upi/upi.gateway';
import { MercadopagoGateway } from './mercadopago/mercadopago.gateway';
import { FlutterwaveGateway } from './flutterwave/flutterwave.gateway';
import { PaystackGateway } from './paystack/paystack.gateway';
import { SquareGateway } from './square/square.gateway';
import { AdyenGateway } from './adyen/adyen.gateway';
import { GatewayService } from './gateway.service';

const GATEWAY_PROVIDERS = [
  StripeGateway,
  PayPalGateway,
  BkashGateway,
  NagadGateway,
  RazorpayGateway,
  SslCommerzGateway,
  AamarpayGateway,
  PaytmGateway,
  PhonePeGateway,
  UpiGateway,
  MercadopagoGateway,
  FlutterwaveGateway,
  PaystackGateway,
  SquareGateway,
  AdyenGateway,
];

@Module({
  providers: [...GATEWAY_PROVIDERS, GatewayService],
  exports: [...GATEWAY_PROVIDERS, GatewayService],
})
export class GatewayModule {}
