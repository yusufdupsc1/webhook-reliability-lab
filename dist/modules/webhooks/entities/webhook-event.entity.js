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
exports.WebhookEvent = void 0;
const typeorm_1 = require("typeorm");
const types_1 = require("../../../common/types");
let WebhookEvent = class WebhookEvent {
};
exports.WebhookEvent = WebhookEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], WebhookEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: types_1.GatewayType,
    }),
    __metadata("design:type", String)
], WebhookEvent.prototype, "gateway", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'event_id', length: 512 }),
    __metadata("design:type", String)
], WebhookEvent.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'event_type' }),
    __metadata("design:type", String)
], WebhookEvent.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'normalized_event_key',
        type: 'varchar',
        nullable: true,
        length: 512,
    }),
    __metadata("design:type", Object)
], WebhookEvent.prototype, "normalizedEventKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], WebhookEvent.prototype, "payload", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'raw_body', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], WebhookEvent.prototype, "rawBody", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'headers', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], WebhookEvent.prototype, "headers", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        default: types_1.WebhookProcessingStatus.RECEIVED,
    }),
    __metadata("design:type", String)
], WebhookEvent.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'signature_status',
        type: 'varchar',
        length: 50,
        default: types_1.WebhookSignatureStatus.PENDING,
    }),
    __metadata("design:type", String)
], WebhookEvent.prototype, "signatureStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'signature_valid', type: 'boolean', nullable: true }),
    __metadata("design:type", Object)
], WebhookEvent.prototype, "signatureValid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duplicate_of_event_id', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], WebhookEvent.prototype, "duplicateOfEventId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'received_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], WebhookEvent.prototype, "receivedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processing_started_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], WebhookEvent.prototype, "processingStartedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_processed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], WebhookEvent.prototype, "firstProcessedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], WebhookEvent.prototype, "processedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'retry_count', default: 0 }),
    __metadata("design:type", Number)
], WebhookEvent.prototype, "retryCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_retry_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], WebhookEvent.prototype, "nextRetryAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], WebhookEvent.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'replay_count', default: 0 }),
    __metadata("design:type", Number)
], WebhookEvent.prototype, "replayCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_replay_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], WebhookEvent.prototype, "lastReplayAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_replay_reason', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], WebhookEvent.prototype, "lastReplayReason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], WebhookEvent.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], WebhookEvent.prototype, "updatedAt", void 0);
exports.WebhookEvent = WebhookEvent = __decorate([
    (0, typeorm_1.Entity)('webhook_events'),
    (0, typeorm_1.Index)(['gateway', 'eventId'], { unique: true }),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['normalizedEventKey']),
    (0, typeorm_1.Index)(['nextRetryAt']),
    (0, typeorm_1.Index)(['createdAt'])
], WebhookEvent);
//# sourceMappingURL=webhook-event.entity.js.map