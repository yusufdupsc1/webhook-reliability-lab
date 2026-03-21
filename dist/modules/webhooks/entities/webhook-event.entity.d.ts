import { GatewayType } from '../../../common/types';
export declare class WebhookEvent {
    id: string;
    gateway: GatewayType;
    eventId: string;
    eventType: string;
    payload: Record<string, unknown>;
    processed: boolean;
    processedAt: Date;
    retryCount: number;
    errorMessage: string;
    createdAt: Date;
}
