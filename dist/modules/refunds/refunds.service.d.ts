import { Repository } from 'typeorm';
import { Refund } from './entities/refund.entity';
import { TransactionsService } from '../transactions/transactions.service';
import { GatewayService } from '../../gateways/gateway.service';
export interface CreateRefundDto {
    transactionId: string;
    amount: number;
    reason?: string;
}
export declare class RefundsService {
    private readonly refundRepository;
    private readonly transactionsService;
    private readonly gatewayService;
    private readonly logger;
    constructor(refundRepository: Repository<Refund>, transactionsService: TransactionsService, gatewayService: GatewayService);
    createRefund(dto: CreateRefundDto): Promise<Refund>;
    findAll(page?: number, limit?: number): Promise<{
        data: Refund[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<Refund | null>;
    getRefundStats(): Promise<{
        totalRefunds: number;
        totalAmount: number;
        pendingRefunds: number;
        byGateway: Record<string, {
            count: number;
            amount: number;
        }>;
    }>;
}
