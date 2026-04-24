import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationGateway } from '../notifications/notification.gateway';
import { NotificationService } from '../notifications/notification.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointments.dto';
import { AppointmentType, AppointmentStatus, Prisma } from '@vetclinic/prisma-client';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);
  private readonly colorMap: Record<AppointmentType, string> = {
    URGENCY: '#ef4444',
    CONSULTATION: '#3b82f6',
    SURGERY: '#8b5cf6',
    VACCINATION: '#22c55e',
    GROOMING: '#f59e0b',
  };

  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway,
    private notificationService: NotificationService,
  ) {}

  async findAll(
    filters: {
      startDate?: Date;
      endDate?: Date;
      doctorId?: string;
      status?: AppointmentStatus;
    },
    pagination?: PaginationDto,
  ) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.AppointmentWhereInput = {};

    if (filters.startDate && filters.endDate) {
      where.dateTime = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }

    if (filters.doctorId) {
      where.doctorId = filters.doctorId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        include: {
          pet: {
            include: {
              client: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phone: true,
                },
              },
            },
          },
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialty: true,
            },
          },
          room: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { dateTime: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return paginate(appointments, total, page, limit);
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            photoUrl: true,
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
          },
        },
        medicalRecord: {
          select: {
            id: true,
            recordDate: true,
            diagnosis: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    return appointment;
  }

  async create(dto: CreateAppointmentDto) {
    const pet = await this.prisma.pet.findUnique({ where: { id: dto.petId } });
    if (!pet) {
      throw new BadRequestException('Mascota no encontrada');
    }

    const doctor = await this.prisma.user.findUnique({ where: { id: dto.doctorId } });
    if (!doctor) {
      throw new BadRequestException('Veterinario no encontrado');
    }

    if (dto.roomId) {
      const room = await this.prisma.room.findUnique({ where: { id: dto.roomId } });
      if (!room) {
        throw new BadRequestException('Sala no encontrada');
      }
    }

    // Validar disponibilidad
    await this.checkAvailability(
      new Date(dto.dateTime),
      dto.duration,
      dto.doctorId,
      dto.roomId,
    );

    const appointment = await this.prisma.appointment.create({
      data: {
        ...dto,
        dateTime: new Date(dto.dateTime),
        colorCode: dto.colorCode || this.colorMap[dto.type],
      },
      include: {
        pet: {
          include: { client: true },
        },
        doctor: true,
        room: true,
      },
    });

    this.notificationGateway.emitAppointmentCreated(appointment);

    this.notificationService.sendAppointmentConfirmation(appointment.id).catch((err) => {
      this.logger.warn(`No se pudo enviar confirmación para cita ${appointment.id}: ${err.message}`);
    });

    return appointment;
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    const current = await this.findOne(id);
    
    // Validar disponibilidad si cambia fecha, duración, doctor o sala
    if (dto.dateTime || dto.duration || dto.doctorId || dto.roomId) {
      await this.checkAvailability(
        new Date(dto.dateTime || current.dateTime),
        dto.duration || current.duration,
        dto.doctorId || current.doctorId,
        dto.roomId || current.roomId,
        id,
      );
    }

    const appointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.dateTime && { dateTime: new Date(dto.dateTime) }),
      },
      include: {
        pet: { include: { client: true } },
        doctor: true,
        room: true,
      },
    });

    this.notificationGateway.emitAppointmentUpdated(appointment);

    return appointment;
  }

  async delete(id: string) {
    await this.findOne(id);

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    this.notificationGateway.emitAppointmentDeleted(id);

    return updated;
  }

  async getCalendar(startDate: Date, endDate: Date) {
    return this.prisma.appointment.findMany({
      where: {
        dateTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        pet: {
          include: {
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { dateTime: 'asc' },
    });
  }

  private async checkAvailability(
    dateTime: Date,
    duration: number,
    doctorId: string,
    roomId?: string,
    excludeAppointmentId?: string,
  ) {
    const start = new Date(dateTime);
    const end = new Date(start.getTime() + duration * 60000);

    // Obtener citas del mismo día para doctor o sala
    const dayStart = new Date(start);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(start);
    dayEnd.setHours(23, 59, 59, 999);

    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        OR: [
          { doctorId },
          ...(roomId ? [{ roomId }] : []),
        ],
        dateTime: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        id: { not: excludeAppointmentId },
      },
    });

    for (const app of existingAppointments) {
      const appStart = new Date(app.dateTime);
      const appEnd = new Date(appStart.getTime() + app.duration * 60000);

      // Algoritmo de traslape: (StartA < EndB) && (EndA > StartB)
      if (start < appEnd && end > appStart) {
        if (app.doctorId === doctorId) {
          throw new BadRequestException(
            `El veterinario ya tiene una cita de ${appStart.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} a ${appEnd.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`,
          );
        }
        if (roomId && app.roomId === roomId) {
          throw new BadRequestException(
            `La sala ya está ocupada de ${appStart.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} a ${appEnd.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`,
          );
        }
      }
    }
  }
}
