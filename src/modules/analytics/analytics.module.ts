import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsDaily } from './entities/analytics-daily.entity';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [TypeOrmModule.forFeature([AnalyticsDaily]), TransactionsModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
