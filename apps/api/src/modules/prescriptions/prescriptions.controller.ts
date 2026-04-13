import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/prescriptions.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Prescriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private prescriptionsService: PrescriptionsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIAN)
  @ApiOperation({ summary: 'Create new prescription' })
  create(@Body() dto: CreatePrescriptionDto, @CurrentUser('sub') userId: string) {
    return this.prescriptionsService.create(dto, userId);
  }

  @Get('medical-record/:recordId')
  @ApiOperation({ summary: 'Get prescriptions by medical record' })
  findByMedicalRecord(@Param('recordId') recordId: string) {
    return this.prescriptionsService.findByMedicalRecord(recordId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get prescription by ID' })
  findOne(@Param('id') id: string) {
    return this.prescriptionsService.findOne(id);
  }
}
