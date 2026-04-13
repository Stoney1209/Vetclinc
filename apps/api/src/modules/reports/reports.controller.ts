import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard KPIs' })
  getDashboardKPIs() {
    return this.reportsService.getDashboardKPIs();
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue by day' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  getRevenueByDay(@Query('days') days?: string) {
    return this.reportsService.getRevenueByDay(days ? parseInt(days) : 7);
  }

  @Get('appointments-by-type')
  @ApiOperation({ summary: 'Get appointments grouped by type' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  getAppointmentsByType(@Query('days') days?: string) {
    return this.reportsService.getAppointmentsByType(days ? parseInt(days) : 30);
  }
}
