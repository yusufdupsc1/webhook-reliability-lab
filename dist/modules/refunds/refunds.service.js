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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RefundsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const refund_entity_1 = require("./entities/refund.entity");
const transactions_service_1 = require("../transactions/transactions.service");
const gateway_service_1 = require("../../gateways/gateway.service");
const types_1 = require("../../common/types");
const audit_service_1 = require("../audit/audit.service");
let RefundsService = RefundsService_1 = class RefundsService {
    constructor(refundRepository, transactionsService, gatewayService, auditService) {
        this.refundRepository = refundRepository;
        this.transactionsService = transactionsService;
        this.gatewayService = gatewayService;
        this.auditService = auditService;
        this.logger = new common_1.Logger(RefundsService_1.name);
    }
    async createRefund(dto) {
        const transaction = await this.transactionsService.findOne(dto.transactionId);
        if (!transaction) {
            throw new common_1.NotFoundException(`Transaction ${dto.transactionId} not found`);
        }
        if (transaction.status !== types_1.TransactionStatus.COMPLETED) {
            throw new common_1.BadRequestException('Only completed transactions can be refunded');
        }
        const availableAmount = transaction.amount - transaction.refundedAmount;
        if (dto.amount > availableAmount) {
            throw new common_1.BadRequestException(`Refund amount exceeds available amount: ${availableAmount}`);
        }
        const response = await this.gatewayService.createRefund(transaction.gateway, transaction.externalId, dto.amount, dto.reason);
        const refund = this.refundRepository.create({
            transactionId: transaction.id,
            externalRefundId: response.externalRefundId,
            amount: dto.amount,
            status: response.status === types_1.RefundStatus.COMPLETED ? types_1.RefundStatus.COMPLETED : types_1.RefundStatus.PENDING,
            reason: dto.reason,
            gatewayResponse: response,
            processedAt: response.status === types_1.RefundStatus.COMPLETED ? new Date() : null,
        });
        const savedRefund = await this.refundRepository.save(refund);
        await this.auditService.recordEntry({
            entityType: types_1.AuditEntityType.REFUND,
            entityId: savedRefund.id,
            transactionId: transaction.id,
            refundId: savedRefund.id,
            gateway: transaction.gateway,
            action: types_1.AuditActionType.REFUND_CREATED,
            previousStatus: null,
            nextStatus: savedRefund.status,
            source: 'refunds.createRefund',
            metadata: {
                amount: savedRefund.amount,
                reason: savedRefund.reason,
                externalRefundId: savedRefund.externalRefundId,
            },
        });
        if (savedRefund.status !== types_1.RefundStatus.PENDING) {
            await this.auditService.recordEntry({
                entityType: types_1.AuditEntityType.REFUND,
                entityId: savedRefund.id,
                transactionId: transaction.id,
                refundId: savedRefund.id,
                gateway: transaction.gateway,
                action: types_1.AuditActionType.REFUND_STATUS_CHANGED,
                previousStatus: types_1.RefundStatus.PENDING,
                nextStatus: savedRefund.status,
                source: 'refunds.createRefund',
                metadata: {
                    amount: savedRefund.amount,
                    externalRefundId: savedRefund.externalRefundId,
                    gatewayResponse: savedRefund.gatewayResponse,
                },
            });
        }
        if (response.success) {
            await this.transactionsService.updateRefundAmount(transaction.id, dto.amount);
            if (dto.amount === availableAmount) {
                await this.transactionsService.updateStatus(transaction.id, types_1.TransactionStatus.REFUNDED, undefined, 'refunds.createRefund', {
                    refundId: savedRefund.id,
                    refundAmount: dto.amount,
                    refundStatus: savedRefund.status,
                });
            }
            else {
                await this.transactionsService.updateStatus(transaction.id, types_1.TransactionStatus.PARTIALLY_REFUNDED, undefined, 'refunds.createRefund', {
                    refundId: savedRefund.id,
                    refundAmount: dto.amount,
                    refundStatus: savedRefund.status,
                });
            }
        }
        return savedRefund;
    }
    async findAll(page = 1, limit = 20) {
        const [data, total] = await this.refundRepository.findAndCount({
            relations: ['transaction'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total, page, limit };
    }
    async findOne(id) {
        return this.refundRepository.findOne({ where: { id }, relations: ['transaction'] });
    }
    async getRefundStats() {
        const stats = await this.refundRepository
            .createQueryBuilder('r')
            .select('t.gateway', 'gateway')
            .addSelect('COUNT(*)', 'count')
            .addSelect('SUM(r.amount)', 'totalAmount')
            .innerJoin('r.transaction', 't')
            .groupBy('t.gateway')
            .getRawMany();
        const pendingCount = await this.refundRepository.count({ where: { status: types_1.RefundStatus.PENDING } });
        const result = {
            totalRefunds: 0,
            totalAmount: 0,
            pendingRefunds: pendingCount,
            byGateway: {},
        };
        for (const stat of stats) {
            result.totalRefunds += parseInt(stat.count, 10);
            result.totalAmount += parseFloat(stat.totalAmount) || 0;
            result.byGateway[stat.gateway] = {
                count: parseInt(stat.count, 10),
                amount: parseFloat(stat.totalAmount) || 0,
            };
        }
        return result;
    }
};
exports.RefundsService = RefundsService;
exports.RefundsService = RefundsService = RefundsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(refund_entity_1.Refund)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        transactions_service_1.TransactionsService,
        gateway_service_1.GatewayService,
        audit_service_1.AuditService])
], RefundsService);
//# sourceMappingURL=refunds.service.js.map