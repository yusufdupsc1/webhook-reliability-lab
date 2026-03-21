import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get dashboard summary' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Dashboard summary' })
  async getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{
    totalTransactions: number;
    totalAmount: number;
    totalRefunds: number;
    netAmount: number;
    successRate: number;
    byGateway: Record<string, { count: number; amount: number }>;
    byStatus: Record<string, number>;
  }> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getSummary(start, end);
  }

  @Get('by-gateway')
  @ApiOperation({ summary: 'Get analytics by gateway' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Gateway analytics' })
  async getByGateway(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{
    gateway: string;
    totalTransactions: number;
    totalAmount: number;
    totalRefunds: number;
    netAmount: number;
  }[]> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getByGateway(start, end);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get transaction trends' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Trends data' })
  async getTrends(@Query('days') days?: number): Promise<{
    date: string;
    transactions: number;
    amount: number;
    refunds: number;
  }[]> {
    return this.analyticsService.getTrends(days || 30);
  }

  @Get('refunds')
  @ApiOperation({ summary: 'Get refund analytics' })
  @ApiResponse({ status: 200, description: 'Refund analytics' })
  async getRefundAnalytics(): Promise<{
    totalRefunds: number;
    totalAmount: number;
    pendingRefunds: number;
    byGateway: Record<string, { count: number; amount: number }>;
  }> {
    return this.analyticsService.getRefundAnalytics();
  }
}
