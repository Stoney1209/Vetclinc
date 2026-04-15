import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { SalesService } from './sales.service';
import { PdfService } from './pdf.service';
import { CreateSaleDto } from './dto/sales.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Role } from '@prisma/client';

@ApiTags('Sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(
    private salesService: SalesService,
    private pdfService: PdfService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all sales (paginated)' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query() pagination?: PaginationDto,
  ) {
    return this.salesService.findAll(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      pagination,
    );
  }

  @Get('daily-summary')
  @ApiOperation({ summary: 'Get daily sales summary' })
  @ApiQuery({ name: 'date', required: false })
  getDailySummary(@Query('date') date?: string) {
    return this.salesService.getDailySummary(date ? new Date(date) : new Date());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale by ID' })
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Get(':id/receipt')
  @ApiOperation({ summary: 'Generate PDF receipt for a sale' })
  async getReceipt(@Param('id') id: string, @Res() res: Response) {
    const sale = await this.salesService.findOne(id);
    const buffer = await this.pdfService.generateSaleReceipt(sale as any);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${id}.pdf`);
    res.send(buffer);
  }

  @Post()
  @ApiOperation({ summary: 'Create new sale' })
  create(@Body() dto: CreateSaleDto, @CurrentUser('sub') userId: string) {
    return this.salesService.create(dto, userId);
  }

  @Patch(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cancel a sale and restore inventory' })
  cancel(@Param('id') id: string) {
    return this.salesService.cancel(id);
  }
}
