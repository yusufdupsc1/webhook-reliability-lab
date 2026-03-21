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
exports.AnalyticsDaily = void 0;
const typeorm_1 = require("typeorm");
const types_1 = require("../../../common/types");
let AnalyticsDaily = class AnalyticsDaily {
};
exports.AnalyticsDaily = AnalyticsDaily;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AnalyticsDaily.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], AnalyticsDaily.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: types_1.GatewayType,
        nullable: true,
    }),
    __metadata("design:type", String)
], AnalyticsDaily.prototype, "gateway", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_transactions', default: 0 }),
    __metadata("design:type", Number)
], AnalyticsDaily.prototype, "totalTransactions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], AnalyticsDaily.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_refunds', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], AnalyticsDaily.prototype, "totalRefunds", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'net_amount', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], AnalyticsDaily.prototype, "netAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failed_transactions', default: 0 }),
    __metadata("design:type", Number)
], AnalyticsDaily.prototype, "failedTransactions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pending_transactions', default: 0 }),
    __metadata("design:type", Number)
], AnalyticsDaily.prototype, "pendingTransactions", void 0);
exports.AnalyticsDaily = AnalyticsDaily = __decorate([
    (0, typeorm_1.Entity)('analytics_daily'),
    (0, typeorm_1.Index)(['date', 'gateway'], { unique: true }),
    (0, typeorm_1.Index)(['date'])
], AnalyticsDaily);
//# sourceMappingURL=analytics-daily.entity.js.map