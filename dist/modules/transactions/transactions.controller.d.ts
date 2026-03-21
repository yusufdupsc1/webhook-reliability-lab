import { TransactionsService, CreatePaymentDto } from './transactions.service';
import { Transaction } from './entities/transaction.entity';
import { GatewayType, TransactionStatus } from '../../common/types';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    initiatePayment(dto: CreatePaymentDto, idempotencyKey: string): Promise<{
        success: boolean;
        transaction: Transaction;
        paymentUrl?: string;
    }>;
    listTransactions(page?: number, limit?: number, gateway?: GatewayType, status?: TransactionStatus, customerEmail?: string): Promise<{
        data: Transaction[];
        total: number;
        page: number;
        limit: number;
    }>;
    getTransaction(id: string): Promise<Transaction>;
    getStats(): Promise<{
        totalTransactions: number;
        totalAmount: number;
        totalRefunded: number;
        byGateway: Record<string, {
            count: number;
            amount: number;
        }>;
    }>;
}
