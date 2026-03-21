import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { Transaction } from './entities/transaction.entity';
import { IdempotencyService } from './idempotency.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  controllers: [TransactionsController],
  providers: [TransactionsService, IdempotencyService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
