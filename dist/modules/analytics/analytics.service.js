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
var AnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const analytics_daily_entity_1 = require("./entities/analytics-daily.entity");
const transactions_service_1 = require("../transactions/transactions.service");
const types_1 = require("../../common/types");
let AnalyticsService = AnalyticsService_1 = class AnalyticsService {
    constructor(analyticsRepository, transactionsService) {
        this.analyticsRepository = analyticsRepository;
        this.transactionsService = transactionsService;
        this.logger = new common_1.Logger(AnalyticsService_1.name);
    }
    async getSummary(startDate, endDate) {
        const where = {};
        if (startDate && endDate) {
            where.createdAt = (0, typeorm_2.Between)(startDate, endDate);
        }
        const stats = await this.transactionsService.getTransactionStats();
        const totalTransactions = stats.totalTransactions;
        const successRate = totalTransactions > 0
            ? ((stats.totalAmount - stats.totalRefunded) / stats.totalAmount) * 100
            : 0;
        return {
            totalTransactions,
            totalAmount: stats.totalAmount,
            totalRefunds: stats.totalRefunded,
            netAmount: stats.totalAmount - stats.totalRefunded,
            successRate: Math.round(successRate * 100) / 100,
            byGateway: stats.byGateway,
            byStatus: {},
        };
    }
    async getByGateway(startDate, endDate) {
        const results = [];
        const stats = await this.transactionsService.getTransactionStats();
        for (const [gateway, data] of Object.entries(stats.byGateway)) {
            results.push({
                gateway,
                totalTransactions: data.count,
                totalAmount: data.amount,
                totalRefunds: 0,
                netAmount: data.amount,
            });
        }
        return results;
    }
    async getTrends(days = 30) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const analytics = await this.analyticsRepository.find({
            where: {
                date: (0, typeorm_2.Between)(startDate, endDate),
            },
            order: { date: 'ASC' },
        });
        return analytics.map((a) => ({
            date: a.date.toISOString().split('T')[0],
            transactions: a.totalTransactions,
            amount: parseFloat(a.totalAmount),
            refunds: parseFloat(a.totalRefunds),
        }));
    }
    async getRefundAnalytics() {
        const stats = await this.analyticsRepository
            .createQueryBuilder('a')
            .select('a.gateway', 'gateway')
            .addSelect('SUM(a.total_refunds)', 'totalRefunds')
            .addSelect('COUNT(*)', 'count')
            .where('a.total_refunds > 0')
            .groupBy('a.gateway')
            .getRawMany();
        const byGateway = {};
        let totalRefunds = 0;
        let totalAmount = 0;
        for (const stat of stats) {
            const amount = parseFloat(stat.totalRefunds) || 0;
            byGateway[stat.gateway] = {
                count: parseInt(stat.count, 10),
                amount,
            };
            totalRefunds += parseInt(stat.count, 10);
            totalAmount += amount;
        }
        return { totalRefunds, totalAmount, pendingRefunds: 0, byGateway };
    }
    async aggregateDailyStats() {
        this.logger.log('Aggregating daily transaction stats...');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const transactions = await this.transactionsService['transactionRepository']
            .createQueryBuilder('t')
            .where('t.created_at >= :startDate', { startDate: yesterday })
            .andWhere('t.created_at < :endDate', { endDate: today })
            .getMany();
        const gatewayStats = {};
        for (const tx of transactions) {
            if (!gatewayStats[tx.gateway]) {
                gatewayStats[tx.gateway] = { transactions: 0, amount: 0, refunds: 0 };
            }
            gatewayStats[tx.gateway].transactions++;
            gatewayStats[tx.gateway].amount += parseFloat(tx.amount);
            if (tx.status === types_1.TransactionStatus.REFUNDED || tx.status === types_1.TransactionStatus.PARTIALLY_REFUNDED) {
                gatewayStats[tx.gateway].refunds += parseFloat(tx.refundedAmount);
            }
        }
        for (const [gateway, stats] of Object.entries(gatewayStats)) {
            const analytics = this.analyticsRepository.create({
                date: yesterday,
                gateway: gateway,
                totalTransactions: stats.transactions,
                totalAmount: stats.amount,
                totalRefunds: stats.refunds,
                netAmount: stats.amount - stats.refunds,
            });
            await this.analyticsRepository.save(analytics);
        }
        this.logger.log('Daily aggregation completed');
    }
};
exports.AnalyticsService = AnalyticsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsService.prototype, "aggregateDailyStats", null);
exports.AnalyticsService = AnalyticsService = AnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(analytics_daily_entity_1.AnalyticsDaily)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        transactions_service_1.TransactionsService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map