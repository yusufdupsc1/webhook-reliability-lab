import { Request } from 'express';
import { WebhooksService } from './webhooks.service';
import { GatewayType } from '../../common/types';
export declare class WebhooksController {
    private readonly webhooksService;
    constructor(webhooksService: WebhooksService);
    handleStripeWebhook(body: string | Record<string, unknown>, signature: string, request: Request): Promise<{
        received: boolean;
    }>;
    handlePayPalWebhook(body: Record<string, unknown>, request: Request): Promise<{
        received: boolean;
    }>;
    handleRazorpayWebhook(body: Record<string, unknown>, signature: string, request: Request): Promise<{
        received: boolean;
    }>;
    handleBkashWebhook(body: Record<string, unknown>, request: Request): Promise<{
        received: boolean;
    }>;
    handleNagadWebhook(body: Record<string, unknown>, request: Request): Promise<{
        received: boolean;
    }>;
    handleGenericWebhook(gateway: GatewayType, body: Record<string, unknown>, request: Request): Promise<{
        received: boolean;
    }>;
    listWebhooks(page?: number, limit?: number): Promise<{
        data: unknown[];
        total: number;
    }>;
    retryWebhook(id: string): Promise<{
        success: boolean;
        message?: string;
    }>;
}
