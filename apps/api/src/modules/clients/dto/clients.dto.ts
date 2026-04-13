import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsEmail, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ example: 'Carlos' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'López' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: 'carlos@email.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  @Transform(({ value }) => (value === '' ? undefined : value))
  email?: string;

  @ApiProperty({ example: '5551234567' })
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @Matches(/^\d{7,15}$/, { message: 'El teléfono debe contener entre 7 y 15 dígitos' })
  phone: string;

  @ApiPropertyOptional({ example: 'Calle Principal #123, Col. Centro' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  address?: string;

  @ApiPropertyOptional({ example: 'XAXX000101XXX' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  rfc?: string;
}

export class UpdateClientDto {
  @ApiPropertyOptional({ example: 'Carlos' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'López' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'carlos@email.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  @Transform(({ value }) => (value === '' ? undefined : value))
  email?: string;

  @ApiPropertyOptional({ example: '5551234567' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @Matches(/^\d{7,15}$/, { message: 'El teléfono debe contener entre 7 y 15 dígitos' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Calle Principal #123, Col. Centro' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  address?: string;

  @ApiPropertyOptional({ example: 'XAXX000101XXX' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  rfc?: string;
}
