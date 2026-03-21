import { Repository } from 'typeorm';
import { AnalyticsDaily } from './entities/analytics-daily.entity';
import { TransactionsService } from '../transactions/transactions.service';
export declare class AnalyticsService {
    private readonly analyticsRepository;
    private readonly transactionsService;
    private readonly logger;
    constructor(analyticsRepository: Repository<AnalyticsDaily>, transactionsService: TransactionsService);
    getSummary(startDate?: Date, endDate?: Date): Promise<{
        totalTransactions: number;
        totalAmount: number;
        totalRefunds: number;
        netAmount: number;
        successRate: number;
        byGateway: Record<string, {
            count: number;
            amount: number;
        }>;
        byStatus: Record<string, number>;
    }>;
    getByGateway(startDate?: Date, endDate?: Date): Promise<{
        gateway: string;
        totalTransactions: number;
        totalAmount: number;
        totalRefunds: number;
        netAmount: number;
    }[]>;
    getTrends(days?: number): Promise<{
        date: string;
        transactions: number;
        amount: number;
        refunds: number;
    }[]>;
    getRefundAnalytics(): Promise<{
        totalRefunds: number;
        totalAmount: number;
        pendingRefunds: number;
        byGateway: Record<string, {
            count: number;
            amount: number;
        }>;
    }>;
    aggregateDailyStats(): Promise<void>;
}
