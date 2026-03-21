"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayType = exports.RefundStatus = exports.TransactionStatus = void 0;
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["COMPLETED"] = "completed";
    TransactionStatus["FAILED"] = "failed";
    TransactionStatus["REFUNDED"] = "refunded";
    TransactionStatus["PARTIALLY_REFUNDED"] = "partially_refunded";
    TransactionStatus["DISPUTED"] = "disputed";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var RefundStatus;
(function (RefundStatus) {
    RefundStatus["PENDING"] = "pending";
    RefundStatus["COMPLETED"] = "completed";
    RefundStatus["FAILED"] = "failed";
})(RefundStatus || (exports.RefundStatus = RefundStatus = {}));
var GatewayType;
(function (GatewayType) {
    GatewayType["STRIPE"] = "stripe";
    GatewayType["PAYPAL"] = "paypal";
    GatewayType["BKASH"] = "bkash";
    GatewayType["NAGAD"] = "nagad";
    GatewayType["RAZORPAY"] = "razorpay";
    GatewayType["SSLCOMMERZ"] = "sslcommerz";
    GatewayType["AAMARPAY"] = "aamarpay";
    GatewayType["PAYTM"] = "paytm";
    GatewayType["PHONEPE"] = "phonepe";
    GatewayType["UPI"] = "upi";
    GatewayType["MERCADOPAGO"] = "mercadopago";
    GatewayType["FLUTTERWAVE"] = "flutterwave";
    GatewayType["PAYSTACK"] = "paystack";
    GatewayType["SQUARE"] = "square";
    GatewayType["ADYEN"] = "adyen";
})(GatewayType || (exports.GatewayType = GatewayType = {}));
//# sourceMappingURL=types.js.map