import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GatewayService } from '../../gateways/gateway.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    gateways: Array<{ type: string; name: string }>;
  }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      gateways: this.gatewayService.getSupportedGateways(),
    };
  }

  @Get('gateways')
  @ApiOperation({ summary: 'List supported gateways' })
  @ApiResponse({ status: 200, description: 'List of supported gateways' })
  async listGateways(): Promise<Array<{ type: string; name: string }>> {
    return this.gatewayService.getSupportedGateways();
  }
}
