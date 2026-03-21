"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const transactions_module_1 = require("./modules/transactions/transactions.module");
const webhooks_module_1 = require("./modules/webhooks/webhooks.module");
const refunds_module_1 = require("./modules/refunds/refunds.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const health_module_1 = require("./modules/health/health.module");
const gateway_module_1 = require("./gateways/gateway.module");
const config_module_1 = require("./config/config.module");
const redis_module_1 = require("./config/redis.module");
const transaction_entity_1 = require("./modules/transactions/entities/transaction.entity");
const webhook_event_entity_1 = require("./modules/webhooks/entities/webhook-event.entity");
const refund_entity_1 = require("./modules/refunds/entities/refund.entity");
const analytics_daily_entity_1 = require("./modules/analytics/entities/analytics-daily.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'public'),
                serveRoot: '/',
            }),
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST', 'localhost'),
                    port: configService.get('DB_PORT', 5432),
                    username: configService.get('DB_USERNAME', 'postgres'),
                    password: configService.get('DB_PASSWORD', 'postgres'),
                    database: configService.get('DB_DATABASE', 'payment_dashboard'),
                    entities: [transaction_entity_1.Transaction, webhook_event_entity_1.WebhookEvent, refund_entity_1.Refund, analytics_daily_entity_1.AnalyticsDaily],
                    synchronize: configService.get('NODE_ENV') !== 'production',
                    logging: configService.get('NODE_ENV') === 'development',
                }),
                inject: [config_1.ConfigService],
            }),
            redis_module_1.RedisModule,
            config_module_1.AppConfigModule,
            gateway_module_1.GatewayModule,
            transactions_module_1.TransactionsModule,
            webhooks_module_1.WebhooksModule,
            refunds_module_1.RefundsModule,
            analytics_module_1.AnalyticsModule,
            health_module_1.HealthModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map