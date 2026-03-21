import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('PayNest - Payment Dashboard API')
    .setDescription('Unified payment gateway orchestration API')
    .setVersion('1.0')
    .addTag('transactions', 'Transaction management')
    .addTag('webhooks', 'Webhook receivers')
    .addTag('refunds', 'Refund operations')
    .addTag('analytics', 'Analytics and reporting')
    .addTag('health', 'Health checks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application running on http://localhost:${port}`);
  logger.log(`API Docs: http://localhost:${port}/docs`);
}

bootstrap();
