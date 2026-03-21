import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getSummary(startDate?: string, endDate?: string): Promise<{
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
    getByGateway(startDate?: string, endDate?: string): Promise<{
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
}
