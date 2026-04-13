import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto, ScheduleFollowUpDto } from './dto/medical-records.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Medical Records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private medicalRecordsService: MedicalRecordsService) {}

  @Get('follow-ups/upcoming')
  @ApiOperation({ summary: 'Get upcoming follow-ups (next 7 days)' })
  getUpcomingFollowUps() {
    return this.medicalRecordsService.getUpcomingFollowUps();
  }

  @Get('pet/:petId')
  @ApiOperation({ summary: 'Get all medical records for a pet (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findByPet(@Param('petId') petId: string, @Query() pagination?: PaginationDto) {
    return this.medicalRecordsService.findByPet(petId, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get medical record by ID' })
  findOne(@Param('id') id: string) {
    return this.medicalRecordsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIAN)
  @ApiOperation({ summary: 'Create new medical record (SOAP)' })
  create(@Body() dto: CreateMedicalRecordDto, @CurrentUser('sub') userId: string) {
    const finalVetId = dto.veterinarianId || userId;
    return this.medicalRecordsService.create(dto, finalVetId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIAN)
  @ApiOperation({ summary: 'Update medical record' })
  update(@Param('id') id: string, @Body() dto: UpdateMedicalRecordDto) {
    return this.medicalRecordsService.update(id, dto);
  }

  @Patch(':id/follow-up')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIAN)
  @ApiOperation({ summary: 'Schedule follow-up for medical record' })
  scheduleFollowUp(@Param('id') id: string, @Body() dto: ScheduleFollowUpDto) {
    return this.medicalRecordsService.scheduleFollowUp(id, dto.followUpDate, dto.followUpNotes);
  }
}
