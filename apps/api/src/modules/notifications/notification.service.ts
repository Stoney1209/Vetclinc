import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway,
  ) {}

  async sendAppointmentConfirmation(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        pet: {
          include: {
            client: true,
          },
        },
        doctor: true,
        room: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    const client = appointment.pet.client;
    const recipient = client.email || client.phone;

    if (!recipient) {
      throw new BadRequestException('El cliente no tiene email ni teléfono registrado');
    }

    const channel = client.email ? 'EMAIL' : 'SMS';

    try {
      this.logger.log(
        `[${channel} CONFIRMATION] Cita ${appointment.id} - ${appointment.pet.name} con Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName} - ${appointment.dateTime.toISOString()}`,
      );

      await this.prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          confirmationChannel: channel,
        },
      });

      await this.prisma.notificationLog.create({
        data: {
          type: 'APPOINTMENT_CONFIRMATION',
          channel,
          recipient,
          status: 'SENT',
          referenceId: appointmentId,
        },
      });

      return { success: true, channel, recipient };
    } catch (error) {
      this.logger.error(`Error enviando confirmación para cita ${appointmentId}`, error);

      await this.prisma.notificationLog.create({
        data: {
          type: 'APPOINTMENT_CONFIRMATION',
          channel,
          recipient,
          status: 'FAILED',
          referenceId: appointmentId,
          error: error.message,
        },
      });

      throw error;
    }
  }

  async confirmAppointment(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    if (appointment.confirmedAt) {
      throw new BadRequestException('La cita ya fue confirmada');
    }

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { confirmedAt: new Date() },
      include: {
        pet: { include: { client: true } },
        doctor: true,
        room: true,
      },
    });
  }

  async resendConfirmation(appointmentId: string) {
    return this.sendAppointmentConfirmation(appointmentId);
  }
}
