import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Query,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiParam } from '@nestjs/swagger';
import { Request } from 'express';
import { WebhooksService } from './webhooks.service';
import { GatewayType } from '../../common/types';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhooks' })
  @ApiHeader({ name: 'stripe-signature', required: true })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleStripeWebhook(
    @Body() body: string | Record<string, unknown>,
    @Headers('stripe-signature') signature: string,
    @Req() request: Request,
  ): Promise<{ received: boolean }> {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }
    const rawBody = typeof body === 'string' ? body : JSON.stringify(body);
    const result = await this.webhooksService.processWebhook(
      GatewayType.STRIPE,
      rawBody,
      request.headers as Record<string, string>,
    );
    return { received: result.success };
  }

  @Post('paypal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle PayPal webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handlePayPalWebhook(
    @Body() body: Record<string, unknown>,
    @Req() request: Request,
  ): Promise<{ received: boolean }> {
    const result = await this.webhooksService.processWebhook(
      GatewayType.PAYPAL,
      body,
      request.headers as Record<string, string>,
    );
    return { received: result.success };
  }

  @Post('razorpay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Razorpay webhooks' })
  @ApiHeader({ name: 'x-razorpay-signature', required: true })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleRazorpayWebhook(
    @Body() body: Record<string, unknown>,
    @Headers('x-razorpay-signature') signature: string,
    @Req() request: Request,
  ): Promise<{ received: boolean }> {
    if (!signature) {
      throw new BadRequestException('Missing x-razorpay-signature header');
    }
    const result = await this.webhooksService.processWebhook(
      GatewayType.RAZORPAY,
      body,
      request.headers as Record<string, string>,
    );
    return { received: result.success };
  }

  @Post('bkash')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle bKash webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleBkashWebhook(
    @Body() body: Record<string, unknown>,
    @Req() request: Request,
  ): Promise<{ received: boolean }> {
    const result = await this.webhooksService.processWebhook(
      GatewayType.BKASH,
      body,
      request.headers as Record<string, string>,
    );
    return { received: result.success };
  }

  @Post('nagad')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Nagad webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleNagadWebhook(
    @Body() body: Record<string, unknown>,
    @Req() request: Request,
  ): Promise<{ received: boolean }> {
    const result = await this.webhooksService.processWebhook(
      GatewayType.NAGAD,
      body,
      request.headers as Record<string, string>,
    );
    return { received: result.success };
  }

  @Post(':gateway')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle generic gateway webhook' })
  @ApiParam({ name: 'gateway', enum: GatewayType })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleGenericWebhook(
    @Param('gateway') gateway: GatewayType,
    @Body() body: Record<string, unknown>,
    @Req() request: Request,
  ): Promise<{ received: boolean }> {
    const result = await this.webhooksService.processWebhook(
      gateway,
      body,
      request.headers as Record<string, string>,
    );
    return { received: result.success };
  }

  @Get()
  @ApiOperation({ summary: 'List webhook events' })
  @ApiResponse({ status: 200, description: 'List of webhook events' })
  async listWebhooks(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ data: unknown[]; total: number }> {
    return this.webhooksService.findAll(page || 1, limit || 20);
  }

  @Post('retry/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retry a failed webhook' })
  @ApiParam({ name: 'id', description: 'Webhook event ID' })
  @ApiResponse({ status: 200, description: 'Retry result' })
  async retryWebhook(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message?: string }> {
    return this.webhooksService.retryWebhook(id);
  }
}
