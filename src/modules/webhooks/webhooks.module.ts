import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { WebhookEvent } from './entities/webhook-event.entity';
import { TransactionsModule } from '../transactions/transactions.module';
import { GatewayModule } from '../../gateways/gateway.module';

@Module({
  imports: [TypeOrmModule.forFeature([WebhookEvent]), TransactionsModule, GatewayModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
