import { GatewayService } from '../../gateways/gateway.service';
export declare class HealthController {
    private readonly gatewayService;
    constructor(gatewayService: GatewayService);
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        gateways: Array<{
            type: string;
            name: string;
        }>;
    }>;
    listGateways(): Promise<Array<{
        type: string;
        name: string;
    }>>;
}
