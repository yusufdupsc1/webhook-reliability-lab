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
exports.Refund = void 0;
const typeorm_1 = require("typeorm");
const types_1 = require("../../../common/types");
const transaction_entity_1 = require("../../transactions/entities/transaction.entity");
let Refund = class Refund {
};
exports.Refund = Refund;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Refund.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_id' }),
    __metadata("design:type", String)
], Refund.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => transaction_entity_1.Transaction),
    (0, typeorm_1.JoinColumn)({ name: 'transaction_id' }),
    __metadata("design:type", transaction_entity_1.Transaction)
], Refund.prototype, "transaction", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'external_refund_id', nullable: true }),
    __metadata("design:type", String)
], Refund.prototype, "externalRefundId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Refund.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: types_1.RefundStatus,
        default: types_1.RefundStatus.PENDING,
    }),
    __metadata("design:type", String)
], Refund.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Refund.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Refund.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gateway_response', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Refund.prototype, "gatewayResponse", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Refund.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Refund.prototype, "processedAt", void 0);
exports.Refund = Refund = __decorate([
    (0, typeorm_1.Entity)('refunds'),
    (0, typeorm_1.Index)(['transactionId']),
    (0, typeorm_1.Index)(['externalRefundId']),
    (0, typeorm_1.Index)(['status'])
], Refund);
//# sourceMappingURL=refund.entity.js.map