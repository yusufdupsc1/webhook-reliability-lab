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
exports.AuditLog = void 0;
const typeorm_1 = require("typeorm");
const types_1 = require("../../../common/types");
let AuditLog = class AuditLog {
};
exports.AuditLog = AuditLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AuditLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'entity_type',
        type: 'enum',
        enum: types_1.AuditEntityType,
    }),
    __metadata("design:type", String)
], AuditLog.prototype, "entityType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entity_id' }),
    __metadata("design:type", String)
], AuditLog.prototype, "entityId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: types_1.AuditActionType,
    }),
    __metadata("design:type", String)
], AuditLog.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'refund_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "refundId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'webhook_event_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "webhookEventId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: types_1.GatewayType,
        nullable: true,
    }),
    __metadata("design:type", Object)
], AuditLog.prototype, "gateway", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'previous_status', type: 'varchar', nullable: true, length: 100 }),
    __metadata("design:type", Object)
], AuditLog.prototype, "previousStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_status', type: 'varchar', nullable: true, length: 100 }),
    __metadata("design:type", Object)
], AuditLog.prototype, "nextStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, default: 'system' }),
    __metadata("design:type", String)
], AuditLog.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AuditLog.prototype, "createdAt", void 0);
exports.AuditLog = AuditLog = __decorate([
    (0, typeorm_1.Entity)('audit_logs'),
    (0, typeorm_1.Index)(['entityType', 'entityId']),
    (0, typeorm_1.Index)(['transactionId']),
    (0, typeorm_1.Index)(['refundId']),
    (0, typeorm_1.Index)(['webhookEventId']),
    (0, typeorm_1.Index)(['createdAt'])
], AuditLog);
//# sourceMappingURL=audit-log.entity.js.map