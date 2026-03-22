"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditActionType = exports.AuditEntityType = exports.WebhookSignatureStatus = exports.WebhookProcessingStatus = exports.GatewayType = exports.RefundStatus = exports.TransactionStatus = void 0;
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
var WebhookProcessingStatus;
(function (WebhookProcessingStatus) {
    WebhookProcessingStatus["RECEIVED"] = "received";
    WebhookProcessingStatus["PROCESSING"] = "processing";
    WebhookProcessingStatus["PROCESSED"] = "processed";
    WebhookProcessingStatus["FAILED"] = "failed";
    WebhookProcessingStatus["INVALID_SIGNATURE"] = "invalid_signature";
    WebhookProcessingStatus["DUPLICATE"] = "duplicate";
})(WebhookProcessingStatus || (exports.WebhookProcessingStatus = WebhookProcessingStatus = {}));
var WebhookSignatureStatus;
(function (WebhookSignatureStatus) {
    WebhookSignatureStatus["PENDING"] = "pending";
    WebhookSignatureStatus["VALID"] = "valid";
    WebhookSignatureStatus["INVALID"] = "invalid";
    WebhookSignatureStatus["NOT_APPLICABLE"] = "not_applicable";
})(WebhookSignatureStatus || (exports.WebhookSignatureStatus = WebhookSignatureStatus = {}));
var AuditEntityType;
(function (AuditEntityType) {
    AuditEntityType["TRANSACTION"] = "transaction";
    AuditEntityType["REFUND"] = "refund";
    AuditEntityType["WEBHOOK_EVENT"] = "webhook_event";
})(AuditEntityType || (exports.AuditEntityType = AuditEntityType = {}));
var AuditActionType;
(function (AuditActionType) {
    AuditActionType["TRANSACTION_CREATED"] = "transaction_created";
    AuditActionType["TRANSACTION_STATUS_CHANGED"] = "transaction_status_changed";
    AuditActionType["REFUND_CREATED"] = "refund_created";
    AuditActionType["REFUND_STATUS_CHANGED"] = "refund_status_changed";
    AuditActionType["WEBHOOK_REPLAY_ATTEMPTED"] = "webhook_replay_attempted";
})(AuditActionType || (exports.AuditActionType = AuditActionType = {}));
//# sourceMappingURL=types.js.map