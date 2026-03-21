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
var TransactionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("./entities/transaction.entity");
const gateway_service_1 = require("../../gateways/gateway.service");
const idempotency_service_1 = require("./idempotency.service");
let TransactionsService = TransactionsService_1 = class TransactionsService {
    constructor(transactionRepository, gatewayService, idempotencyService) {
        this.transactionRepository = transactionRepository;
        this.gatewayService = gatewayService;
        this.idempotencyService = idempotencyService;
        this.logger = new common_1.Logger(TransactionsService_1.name);
    }
    async createPayment(dto) {
        const existingTransactionId = await this.idempotencyService.checkAndStore(dto.idempotencyKey);
        if (existingTransactionId) {
            this.logger.log(`Returning existing transaction for idempotency key: ${dto.idempotencyKey}`);
            const existingTransaction = await this.findOne(existingTransactionId);
            if (existingTransaction) {
                return existingTransaction;
            }
        }
        const response = await this.gatewayService.createPayment(dto.gateway, dto.amount, dto.currency, dto.customer, dto.idempotencyKey, dto.metadata, dto.returnUrl);
        const transaction = this.transactionRepository.create({
            externalId: response.externalId,
            gateway: dto.gateway,
            amount: dto.amount,
            currency: dto.currency,
            status: response.status,
            customerEmail: dto.customer.email,
            customerPhone: dto.customer.phone,
            customerName: dto.customer.name,
            metadata: dto.metadata,
            gatewayResponse: response.gatewayResponse,
            idempotencyKey: dto.idempotencyKey,
            paymentUrl: response.paymentUrl,
            returnUrl: dto.returnUrl,
        });
        const savedTransaction = await this.transactionRepository.save(transaction);
        await this.idempotencyService.store(dto.idempotencyKey, savedTransaction.id);
        return savedTransaction;
    }
    async findAll(filters, page = 1, limit = 20) {
        const where = {};
        if (filters.gateway)
            where.gateway = filters.gateway;
        if (filters.status)
            where.status = filters.status;
        if (filters.customerEmail)
            where.customerEmail = filters.customerEmail;
        const [data, total] = await this.transactionRepository.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total, page, limit };
    }
    async findOne(id) {
        return this.transactionRepository.findOne({ where: { id } });
    }
    async findByExternalId(externalId, gateway) {
        return this.transactionRepository.findOne({ where: { externalId, gateway } });
    }
    async updateStatus(id, status, gatewayResponse) {
        const transaction = await this.findOne(id);
        if (!transaction)
            return null;
        transaction.status = status;
        if (gatewayResponse)
            transaction.gatewayResponse = gatewayResponse;
        return this.transactionRepository.save(transaction);
    }
    async updateRefundAmount(id, refundedAmount) {
        await this.transactionRepository.increment({ id }, 'refundedAmount', refundedAmount);
    }
    async getTransactionStats() {
        const stats = await this.transactionRepository
            .createQueryBuilder('t')
            .select('t.gateway', 'gateway')
            .addSelect('COUNT(*)', 'count')
            .addSelect('SUM(t.amount)', 'totalAmount')
            .addSelect('SUM(t.refundedAmount)', 'totalRefunded')
            .groupBy('t.gateway')
            .getRawMany();
        const result = {
            totalTransactions: 0,
            totalAmount: 0,
            totalRefunded: 0,
            byGateway: {},
        };
        for (const stat of stats) {
            result.totalTransactions += parseInt(stat.count, 10);
            result.totalAmount += parseFloat(stat.totalAmount) || 0;
            result.totalRefunded += parseFloat(stat.totalRefunded) || 0;
            result.byGateway[stat.gateway] = {
                count: parseInt(stat.count, 10),
                amount: parseFloat(stat.totalAmount) || 0,
            };
        }
        return result;
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = TransactionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        gateway_service_1.GatewayService,
        idempotency_service_1.IdempotencyService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map