import { GatewayService } from '../../gateways/gateway.service';
import { WebhooksService } from '../webhooks/webhooks.service';
export declare class HealthController {
    private readonly gatewayService;
    private readonly webhooksService;
    constructor(gatewayService: GatewayService, webhooksService: WebhooksService);
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        gateways: Array<{
            type: string;
            name: string;
        }>;
        webhooks: {
            backlog: {
                total: number;
                retryable: number;
                failed: number;
                processing: number;
                invalidSignature: number;
                oldestPendingAt?: string | null;
            };
            reliability: {
                status: 'healthy' | 'active' | 'attention';
                replayable: number;
                blockedReplay: number;
                maxRetriesExceeded: number;
                lastReceivedAt: string | null;
                lastProcessedAt: string | null;
                backlogAgeSeconds: number | null;
                recent24h: {
                    received: number;
                    processed: number;
                    failed: number;
                    invalidSignature: number;
                    replayed: number;
                };
            };
        };
    }>;
    listGateways(): Promise<Array<{
        type: string;
        name: string;
    }>>;
}
