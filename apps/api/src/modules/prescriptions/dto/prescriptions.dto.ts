import { IsString, IsOptional, IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePrescriptionItemDto {
  @ApiProperty({ example: 'Amoxicilina 500mg' })
  @IsString()
  productName: string;

  @ApiProperty({ example: '500mg' })
  @IsString()
  dosage: string;

  @ApiProperty({ example: 'cada 8 horas' })
  @IsString()
  frequency: string;

  @ApiProperty({ example: '7 días' })
  @IsString()
  duration: string;

  @ApiProperty({ example: 21 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ example: 'Tomar con alimentos' })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({ example: 'product-uuid-123' })
  @IsOptional()
  @IsString()
  productId?: string;
}

export class CreatePrescriptionDto {
  @ApiProperty({ example: 'record-uuid-123' })
  @IsString()
  medicalRecordId: string;

  @ApiPropertyOptional({ example: 'Seguir indicaciones estrictamente' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [CreatePrescriptionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePrescriptionItemDto)
  items: CreatePrescriptionItemDto[];
}
