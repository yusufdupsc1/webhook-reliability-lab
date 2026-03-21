import { RefundsService, CreateRefundDto } from './refunds.service';
import { Refund } from './entities/refund.entity';
export declare class RefundsController {
    private readonly refundsService;
    constructor(refundsService: RefundsService);
    createRefund(dto: CreateRefundDto): Promise<{
        success: boolean;
        refund: Refund;
    }>;
    listRefunds(page?: number, limit?: number): Promise<{
        data: Refund[];
        total: number;
        page: number;
        limit: number;
    }>;
    getRefundStats(): Promise<{
        totalRefunds: number;
        totalAmount: number;
        pendingRefunds: number;
        byGateway: Record<string, {
            count: number;
            amount: number;
        }>;
    }>;
    getRefund(id: string): Promise<Refund>;
}
