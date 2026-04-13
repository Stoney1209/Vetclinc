import { IsString, IsOptional, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AppointmentType, AppointmentStatus } from '@prisma/client';

export class CreateAppointmentDto {
  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  @IsDateString()
  dateTime: string;

  @ApiProperty({ example: 30 })
  @Type(() => Number)
  @IsInt()
  @Min(5)
  duration: number;

  @ApiProperty({ enum: AppointmentType })
  @IsEnum(AppointmentType)
  type: AppointmentType;

  @ApiPropertyOptional({ example: 'Control anual' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: '#3b82f6' })
  @IsOptional()
  @IsString()
  colorCode?: string;

  @ApiProperty({ example: 'pet-uuid-123' })
  @IsString()
  petId: string;

  @ApiProperty({ example: 'doctor-uuid-123' })
  @IsString()
  doctorId: string;

  @ApiPropertyOptional({ example: 'room-uuid-123' })
  @IsOptional()
  @IsString()
  roomId?: string;
}

export class UpdateAppointmentDto {
  @ApiPropertyOptional({ example: '2024-01-15T11:00:00Z' })
  @IsOptional()
  @IsDateString()
  dateTime?: string;

  @ApiPropertyOptional({ example: 45 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(5)
  duration?: number;

  @ApiPropertyOptional({ enum: AppointmentType })
  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType;

  @ApiPropertyOptional({ enum: AppointmentStatus })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({ example: 'El cliente llegó tarde' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'room-uuid-123' })
  @IsOptional()
  @IsString()
  roomId?: string;
}
