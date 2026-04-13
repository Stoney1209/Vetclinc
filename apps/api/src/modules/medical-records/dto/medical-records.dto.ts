import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMedicalRecordDto {
  @ApiProperty({ example: 'pet-uuid-123' })
  @IsString()
  petId: string;

  @ApiPropertyOptional({ example: 'appointment-uuid-123' })
  @IsOptional()
  @IsString()
  appointmentId?: string;

  @ApiPropertyOptional({ example: 'vet-uuid-123' })
  @IsOptional()
  @IsString()
  veterinarianId?: string;

  @ApiPropertyOptional({ example: 'Dueño reporta que ha estado cojeando de la pata trasera por 3 días' })
  @IsOptional()
  @IsString()
  subjective?: string;

  @ApiPropertyOptional({ example: 'Temperatura 38.5°C, cojera en pata trasera derecha, sin inflamación visible' })
  @IsOptional()
  @IsString()
  objective?: string;

  @ApiPropertyOptional({ example: 'Posible displasia de cadera o lesión muscular' })
  @IsOptional()
  @IsString()
  assessment?: string;

  @ApiPropertyOptional({ example: '1. Radiografía de cadera\n2. Reposo por 2 semanas\n3. Antiinflamatorio' })
  @IsOptional()
  @IsString()
  plan?: string;

  @ApiPropertyOptional({ example: 'Displasia de cadera (probable)' })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ example: 'Meloxicam 0.1mg/kg cada 24hrs por 7 días' })
  @IsOptional()
  @IsString()
  treatment?: string;
}

export class UpdateMedicalRecordDto {
  @ApiPropertyOptional({ example: 'Dueño reporta mejora' })
  @IsOptional()
  @IsString()
  subjective?: string;

  @ApiPropertyOptional({ example: 'Cojera reducida, temperatura normal' })
  @IsOptional()
  @IsString()
  objective?: string;

  @ApiPropertyOptional({ example: 'Respuesta positiva al tratamiento' })
  @IsOptional()
  @IsString()
  assessment?: string;

  @ApiPropertyOptional({ example: 'Continuar con reposo, siguiente control en 2 semanas' })
  @IsOptional()
  @IsString()
  plan?: string;

  @ApiPropertyOptional({ example: 'Displasia de cadera confirmada' })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ example: 'Continuar con meloxicam, agregar condroprotectores' })
  @IsOptional()
  @IsString()
  treatment?: string;
}

export class ScheduleFollowUpDto {
  @ApiProperty({ example: '2024-02-15T10:00:00Z' })
  @IsDateString()
  followUpDate: string;

  @ApiPropertyOptional({ example: 'Control de evolución post-tratamiento' })
  @IsOptional()
  @IsString()
  followUpNotes?: string;
}
