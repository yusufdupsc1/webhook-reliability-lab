import { GatewayType } from '../../../common/types';
export declare class AnalyticsDaily {
    id: string;
    date: Date;
    gateway: GatewayType;
    totalTransactions: number;
    totalAmount: number;
    totalRefunds: number;
    netAmount: number;
    failedTransactions: number;
    pendingTransactions: number;
}
