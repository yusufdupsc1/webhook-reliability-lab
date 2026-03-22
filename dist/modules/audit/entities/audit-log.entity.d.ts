import { AuditActionType, AuditEntityType, GatewayType } from '../../../common/types';
export declare class AuditLog {
    id: string;
    entityType: AuditEntityType;
    entityId: string;
    action: AuditActionType;
    transactionId: string | null;
    refundId: string | null;
    webhookEventId: string | null;
    gateway: GatewayType | null;
    previousStatus: string | null;
    nextStatus: string | null;
    source: string;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
}
