import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditActionType, AuditEntityType, GatewayType } from '../../common/types';
interface RecordAuditEntryInput {
    entityType: AuditEntityType;
    entityId: string;
    action: AuditActionType;
    transactionId?: string | null;
    refundId?: string | null;
    webhookEventId?: string | null;
    gateway?: GatewayType | null;
    previousStatus?: string | null;
    nextStatus?: string | null;
    source?: string;
    metadata?: Record<string, unknown> | null;
}
export declare class AuditService {
    private readonly auditLogRepository;
    constructor(auditLogRepository: Repository<AuditLog>);
    recordEntry(input: RecordAuditEntryInput): Promise<AuditLog>;
}
export {};
