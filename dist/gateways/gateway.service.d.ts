import { IGateway } from './interfaces/gateway.interface';
import { GatewayType, PaymentCustomer, PaymentMetadata, PaymentResponse, RefundResponse, WebhookVerificationResult } from '../common/types';
import { StripeGateway } from './stripe/stripe.gateway';
import { PayPalGateway } from './paypal/paypal.gateway';
import { BkashGateway } from './bkash/bkash.gateway';
import { NagadGateway } from './nagad/nagad.gateway';
import { RazorpayGateway } from './razorpay/razorpay.gateway';
import { MercadopagoGateway } from './mercadopago/mercadopago.gateway';
import { FlutterwaveGateway } from './flutterwave/flutterwave.gateway';
import { PaystackGateway } from './paystack/paystack.gateway';
import { SquareGateway } from './square/square.gateway';
import { AdyenGateway } from './adyen/adyen.gateway';
export declare class GatewayService {
    private readonly stripeGateway;
    private readonly paypalGateway;
    private readonly bkashGateway;
    private readonly nagadGateway;
    private readonly razorpayGateway;
    private readonly mercadopagoGateway;
    private readonly flutterwaveGateway;
    private readonly paystackGateway;
    private readonly squareGateway;
    private readonly adyenGateway;
    private readonly gateways;
    constructor(stripeGateway: StripeGateway, paypalGateway: PayPalGateway, bkashGateway: BkashGateway, nagadGateway: NagadGateway, razorpayGateway: RazorpayGateway, mercadopagoGateway: MercadopagoGateway, flutterwaveGateway: FlutterwaveGateway, paystackGateway: PaystackGateway, squareGateway: SquareGateway, adyenGateway: AdyenGateway);
    getGateway(type: GatewayType): IGateway;
    createPayment(gatewayType: GatewayType, amount: number, currency: string, customer: PaymentCustomer, idempotencyKey: string, metadata?: PaymentMetadata, returnUrl?: string): Promise<PaymentResponse>;
    verifyWebhook(gatewayType: GatewayType, payload: string | Record<string, unknown>, headers: Record<string, string>): Promise<WebhookVerificationResult>;
    createRefund(gatewayType: GatewayType, transactionExternalId: string, amount: number, reason?: string): Promise<RefundResponse>;
    getSupportedGateways(): Array<{
        type: GatewayType;
        name: string;
    }>;
}
