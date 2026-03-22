import { RefundStatus } from '../../../common/types';
import { Transaction } from '../../transactions/entities/transaction.entity';
export declare class Refund {
    id: string;
    transactionId: string;
    transaction: Transaction;
    externalRefundId: string | null;
    amount: number;
    status: RefundStatus;
    reason: string | null;
    metadata: Record<string, unknown> | null;
    gatewayResponse: Record<string, unknown> | null;
    createdAt: Date;
    processedAt: Date | null;
}
