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
exports.Transaction = void 0;
const typeorm_1 = require("typeorm");
const types_1 = require("../../../common/types");
let Transaction = class Transaction {
};
exports.Transaction = Transaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Transaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'external_id', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "externalId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: types_1.GatewayType,
        default: types_1.GatewayType.STRIPE,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "gateway", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3, default: 'USD' }),
    __metadata("design:type", String)
], Transaction.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: types_1.TransactionStatus,
        default: types_1.TransactionStatus.PENDING,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_email', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "customerEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_phone', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "customerPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_name', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "customerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Transaction.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gateway_response', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Transaction.prototype, "gatewayResponse", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'idempotency_key', unique: true }),
    __metadata("design:type", String)
], Transaction.prototype, "idempotencyKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_url', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "paymentUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'return_url', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "returnUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'refunded_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Transaction.prototype, "refundedAmount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Transaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Transaction.prototype, "updatedAt", void 0);
exports.Transaction = Transaction = __decorate([
    (0, typeorm_1.Entity)('transactions'),
    (0, typeorm_1.Index)(['idempotencyKey'], { unique: true }),
    (0, typeorm_1.Index)(['externalId', 'gateway']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['createdAt'])
], Transaction);
//# sourceMappingURL=transaction.entity.js.map