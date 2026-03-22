"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const app_factory_1 = require("./app.factory");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = (0, app_factory_1.configureApp)(await core_1.NestFactory.create(app_module_1.AppModule));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('PayNest - Payment Dashboard API')
        .setDescription('Unified payment gateway orchestration API')
        .setVersion('1.0')
        .addTag('transactions', 'Transaction management')
        .addTag('webhooks', 'Webhook receivers')
        .addTag('refunds', 'Refund operations')
        .addTag('analytics', 'Analytics and reporting')
        .addTag('health', 'Health checks')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`Application running on http://localhost:${port}`);
    logger.log(`API Docs: http://localhost:${port}/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map