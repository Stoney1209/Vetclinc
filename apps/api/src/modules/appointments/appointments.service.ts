import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationGateway } from '../notifications/notification.gateway';
import { NotificationService } from '../notifications/notification.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointments.dto';
import { AppointmentType, AppointmentStatus } from '@prisma/client';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

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
    await this.findOne(id);

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
}
