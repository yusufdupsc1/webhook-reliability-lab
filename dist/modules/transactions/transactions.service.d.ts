import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { GatewayService } from '../../gateways/gateway.service';
import { IdempotencyService } from './idempotency.service';
import { GatewayType, TransactionStatus, PaymentCustomer, PaymentMetadata } from '../../common/types';
import { AuditService } from '../audit/audit.service';
export interface CreatePaymentDto {
    gateway: GatewayType;
    amount: number;
    currency: string;
    customer: PaymentCustomer;
    idempotencyKey: string;
    metadata?: PaymentMetadata;
    returnUrl?: string;
}
export interface TransactionFilters {
    gateway?: GatewayType;
    status?: TransactionStatus;
    customerEmail?: string;
    startDate?: Date;
    endDate?: Date;
}
export declare class TransactionsService {
    private readonly transactionRepository;
    private readonly gatewayService;
    private readonly idempotencyService;
    private readonly auditService;
    private readonly logger;
    constructor(transactionRepository: Repository<Transaction>, gatewayService: GatewayService, idempotencyService: IdempotencyService, auditService: AuditService);
    createPayment(dto: CreatePaymentDto): Promise<Transaction>;
    findAll(filters: TransactionFilters, page?: number, limit?: number): Promise<{
        data: Transaction[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<Transaction | null>;
    findByExternalId(externalId: string, gateway: GatewayType): Promise<Transaction | null>;
    updateStatus(id: string, status: TransactionStatus, gatewayResponse?: Record<string, unknown>, source?: string, metadata?: Record<string, unknown>): Promise<Transaction | null>;
    updateRefundAmount(id: string, refundedAmount: number): Promise<void>;
    getTransactionStats(): Promise<{
        totalTransactions: number;
        totalAmount: number;
        totalRefunded: number;
        byGateway: Record<string, {
            count: number;
            amount: number;
        }>;
    }>;
}
