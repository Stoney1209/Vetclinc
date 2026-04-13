import { IsEmail, IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'vet@vetclinic.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'María' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'García' })
  @IsString()
  lastName: string;

  @ApiProperty({ enum: Role, default: Role.RECEPTIONIST })
  @IsEnum(Role)
  role: Role;

  @ApiPropertyOptional({ example: 'Medicina General' })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiPropertyOptional({ example: 'Cédula-54321' })
  @IsOptional()
  @IsString()
  licenseNumber?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'María' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'García' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ example: 'Cirugía' })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiPropertyOptional({ example: 'Cédula-54321' })
  @IsOptional()
  @IsString()
  licenseNumber?: string;
}
