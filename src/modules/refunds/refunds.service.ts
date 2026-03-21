import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Refund } from './entities/refund.entity';
import { TransactionsService } from '../transactions/transactions.service';
import { GatewayService } from '../../gateways/gateway.service';
import { RefundStatus, TransactionStatus, GatewayType } from '../../common/types';

export interface CreateRefundDto {
  transactionId: string;
  amount: number;
  reason?: string;
}

@Injectable()
export class RefundsService {
  private readonly logger = new Logger(RefundsService.name);

  constructor(
    @InjectRepository(Refund)
    private readonly refundRepository: Repository<Refund>,
    private readonly transactionsService: TransactionsService,
    private readonly gatewayService: GatewayService,
  ) {}

  async createRefund(dto: CreateRefundDto): Promise<Refund> {
    const transaction = await this.transactionsService.findOne(dto.transactionId);

    if (!transaction) {
      throw new NotFoundException(`Transaction ${dto.transactionId} not found`);
    }

    if (transaction.status !== TransactionStatus.COMPLETED) {
      throw new BadRequestException('Only completed transactions can be refunded');
    }

    const availableAmount = transaction.amount - transaction.refundedAmount;
    if (dto.amount > availableAmount) {
      throw new BadRequestException(`Refund amount exceeds available amount: ${availableAmount}`);
    }

    const response = await this.gatewayService.createRefund(
      transaction.gateway,
      transaction.externalId,
      dto.amount,
      dto.reason,
    );

    const refund = this.refundRepository.create({
      transactionId: transaction.id,
      externalRefundId: response.externalRefundId,
      amount: dto.amount,
      status: response.status === RefundStatus.COMPLETED ? RefundStatus.COMPLETED : RefundStatus.PENDING,
      reason: dto.reason,
      gatewayResponse: response as unknown as Record<string, unknown>,
    });

    const savedRefund = await this.refundRepository.save(refund);

    if (response.success) {
      await this.transactionsService.updateRefundAmount(transaction.id, dto.amount);

      if (dto.amount === availableAmount) {
        await this.transactionsService.updateStatus(transaction.id, TransactionStatus.REFUNDED);
      } else {
        await this.transactionsService.updateStatus(transaction.id, TransactionStatus.PARTIALLY_REFUNDED);
      }
    }

    return savedRefund;
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Refund[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.refundRepository.findAndCount({
      relations: ['transaction'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Refund | null> {
    return this.refundRepository.findOne({ where: { id }, relations: ['transaction'] });
  }

  async getRefundStats(): Promise<{
    totalRefunds: number;
    totalAmount: number;
    pendingRefunds: number;
    byGateway: Record<string, { count: number; amount: number }>;
  }> {
    const stats = await this.refundRepository
      .createQueryBuilder('r')
      .select('t.gateway', 'gateway')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(r.amount)', 'totalAmount')
      .innerJoin('r.transaction', 't')
      .groupBy('t.gateway')
      .getRawMany();

    const pendingCount = await this.refundRepository.count({ where: { status: RefundStatus.PENDING } });

    const result = {
      totalRefunds: 0,
      totalAmount: 0,
      pendingRefunds: pendingCount,
      byGateway: {} as Record<string, { count: number; amount: number }>,
    };

    for (const stat of stats) {
      result.totalRefunds += parseInt(stat.count, 10);
      result.totalAmount += parseFloat(stat.totalAmount) || 0;
      result.byGateway[stat.gateway] = {
        count: parseInt(stat.count, 10),
        amount: parseFloat(stat.totalAmount) || 0,
      };
    }

    return result;
  }
}
