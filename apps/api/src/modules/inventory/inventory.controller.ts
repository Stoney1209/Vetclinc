import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateProductDto, UpdateProductDto, AdjustStockDto, CreateCategoryDto } from './dto/inventory.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products (paginated)' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query() pagination?: PaginationDto,
  ) {
    return this.inventoryService.findAll(categoryId, pagination);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock alerts' })
  getLowStock() {
    return this.inventoryService.getLowStock();
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get expiring products' })
  @ApiQuery({ name: 'days', required: false })
  getExpiring(@Query('days') days?: string) {
    return this.inventoryService.getExpiring(days ? parseInt(days) : 30);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  getCategories() {
    return this.inventoryService.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.INVENTORY_MANAGER)
  @ApiOperation({ summary: 'Create new product' })
  create(@Body() dto: CreateProductDto) {
    return this.inventoryService.create(dto);
  }

  @Post('categories')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.INVENTORY_MANAGER)
  @ApiOperation({ summary: 'Create new category' })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.inventoryService.createCategory(dto.name, dto.type);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.INVENTORY_MANAGER)
  @ApiOperation({ summary: 'Update product' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.inventoryService.update(id, dto);
  }

  @Patch(':id/adjust-stock')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.INVENTORY_MANAGER)
  @ApiOperation({ summary: 'Adjust product stock' })
  adjustStock(@Param('id') id: string, @Body() dto: AdjustStockDto) {
    return this.inventoryService.adjustStock(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.INVENTORY_MANAGER)
  @ApiOperation({ summary: 'Delete (soft) product' })
  delete(@Param('id') id: string) {
    return this.inventoryService.delete(id);
  }
}
