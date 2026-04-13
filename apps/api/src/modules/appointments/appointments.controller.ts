import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointments.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AppointmentStatus } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { NotificationService } from '../notifications/notification.service';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(
    private appointmentsService: AppointmentsService,
    private notificationService: NotificationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all appointments with filters (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query() pagination: PaginationDto) {
    return this.appointmentsService.findAll({
      startDate: pagination.startDate ? new Date(pagination.startDate) : undefined,
      endDate: pagination.endDate ? new Date(pagination.endDate) : undefined,
      doctorId: pagination.doctorId,
      status: pagination.status as AppointmentStatus,
    }, pagination);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get appointments for calendar view' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  getCalendar(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.appointmentsService.getCalendar(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIAN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Create new appointment' })
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIAN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Update appointment' })
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIAN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Cancel appointment' })
  delete(@Param('id') id: string) {
    return this.appointmentsService.delete(id);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm appointment' })
  confirm(@Param('id') id: string) {
    return this.notificationService.confirmAppointment(id);
  }

  @Post(':id/resend-confirmation')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Resend appointment confirmation notification' })
  resendConfirmation(@Param('id') id: string) {
    return this.notificationService.resendConfirmation(id);
  }
}
