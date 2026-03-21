import { RefundStatus } from '../../../common/types';
import { Transaction } from '../../transactions/entities/transaction.entity';
export declare class Refund {
    id: string;
    transactionId: string;
    transaction: Transaction;
    externalRefundId: string;
    amount: number;
    status: RefundStatus;
    reason: string;
    metadata: Record<string, unknown>;
    gatewayResponse: Record<string, unknown>;
    createdAt: Date;
    processedAt: Date;
}
