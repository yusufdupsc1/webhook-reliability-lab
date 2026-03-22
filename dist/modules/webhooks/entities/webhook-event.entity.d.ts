import { GatewayType, WebhookProcessingStatus, WebhookSignatureStatus } from '../../../common/types';
export declare class WebhookEvent {
    id: string;
    gateway: GatewayType;
    eventId: string;
    eventType: string;
    normalizedEventKey: string | null;
    payload: Record<string, unknown>;
    rawBody: string | null;
    headers: Record<string, string> | null;
    status: WebhookProcessingStatus;
    signatureStatus: WebhookSignatureStatus;
    signatureValid: boolean | null;
    duplicateOfEventId: string | null;
    receivedAt: Date;
    processingStartedAt: Date | null;
    firstProcessedAt: Date | null;
    processedAt: Date | null;
    retryCount: number;
    nextRetryAt: Date | null;
    errorMessage: string | null;
    replayCount: number;
    lastReplayAt: Date | null;
    lastReplayReason: string | null;
    createdAt: Date;
    updatedAt: Date;
}
