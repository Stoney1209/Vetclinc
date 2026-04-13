import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'Amoxicilina 500mg' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'AMOX-500-24' })
  @IsString()
  sku: string;

  @ApiPropertyOptional({ example: 'Antibiótico de amplio espectro' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 150.00 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 95.00 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cost?: number;

  @ApiProperty({ example: 50 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minStock?: number;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional()
  expiryDate?: string;

  @ApiPropertyOptional({ example: 'LOTE-2024-A' })
  @IsOptional()
  @IsString()
  batch?: string;

  @ApiProperty({ example: 'category-uuid-123' })
  @IsString()
  categoryId: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Amoxicilina 500mg' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'AMOX-500-24' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ example: 'Antibiótico de amplio espectro' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 160.00 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ example: 100.00 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cost?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minStock?: number;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  expiryDate?: string;
}

export class AdjustStockDto {
  @ApiProperty({ example: -5, description: 'Negative for reduction, positive for addition' })
  @Type(() => Number)
  @IsNumber()
  adjustment: number;

  @ApiPropertyOptional({ example: 'Venta directa' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateCategoryDto {
  @ApiProperty({ example: 'Medicamentos' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'medicine' })
  @IsString()
  type: string;
}
