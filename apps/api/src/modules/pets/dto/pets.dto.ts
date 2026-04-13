import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FilterPetsDto {
  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsString()
  species?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsString()
  clientId?: string;
}

export class CreatePetDto {
  @ApiProperty({ example: 'Firulais' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Perro' })
  @IsString()
  species: string;

  @ApiPropertyOptional({ example: 'Labrador' })
  @IsOptional()
  @IsString()
  breed?: string;

  @ApiPropertyOptional({ example: '2020-05-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'Macho' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: 'Dorado' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 25.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ example: '123456789012345' })
  @IsOptional()
  @IsString()
  microchip?: string;

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ example: 'Alérgico a ciertos alimentos' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePetDto {
  @ApiPropertyOptional({ example: 'Firulais' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Labrador' })
  @IsOptional()
  @IsString()
  breed?: string;

  @ApiPropertyOptional({ example: 'Macho' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: 'Dorado' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 25.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ example: 'Alérgico a ciertos alimentos' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AddWeightDto {
  @ApiProperty({ example: 26.5 })
  @Type(() => Number)
  @IsNumber()
  weight: number;

  @ApiPropertyOptional({ example: 'Después de comer' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AddVaccinationDto {
  @ApiProperty({ example: 'Rabia' })
  @IsString()
  vaccineName: string;

  @ApiPropertyOptional({ example: 'LOTE-2024-001' })
  @IsOptional()
  @IsString()
  batch?: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  applicationDate: string;

  @ApiPropertyOptional({ example: '2025-01-15' })
  @IsOptional()
  @IsDateString()
  nextDueDate?: string;

  @ApiPropertyOptional({ example: 'Dr. Juan Pérez' })
  @IsOptional()
  @IsString()
  veterinarian?: string;

  @ApiPropertyOptional({ example: 'Primera dosis' })
  @IsOptional()
  @IsString()
  notes?: string;
}
