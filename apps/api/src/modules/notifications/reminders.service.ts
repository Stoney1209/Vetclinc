import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from './mail.service';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleDailyReminders() {
    this.logger.log('Iniciando envío de recordatorios automáticos (Cron)...');
    await this.processAppointmentReminders();
    await this.processVaccineReminders();
    await this.processFollowUpReminders();
    this.logger.log('Envío de recordatorios finalizado.');
  }

  async triggerManualReminders() {
    return this.handleDailyReminders();
  }

  private async processAppointmentReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    try {
      const appointments = await this.prisma.appointment.findMany({
        where: {
          dateTime: {
            gte: tomorrow,
            lte: endOfTomorrow,
          },
          status: 'SCHEDULED',
        },
        include: {
          pet: {
            include: { client: true },
          },
        },
      });

      let count = 0;
      for (const appt of appointments) {
        const existingLog = await this.prisma.notificationLog.findFirst({
          where: {
            referenceId: appt.id,
            type: 'APPOINTMENT',
            status: 'SENT',
          },
        });

        if (!existingLog) {
          const email = appt.pet.client.email;
          if (email) {
            const success = await this.mailService.sendAppointmentReminder(
              email,
              `${appt.pet.client.firstName} ${appt.pet.client.lastName}`,
              appt.dateTime.toLocaleString(),
              appt.pet.name
            );

            if (success) {
              await this.prisma.notificationLog.create({
                data: {
                  type: 'APPOINTMENT',
                  channel: 'EMAIL',
                  recipient: email,
                  status: 'SENT',
                  referenceId: appt.id,
                },
              });
              count++;
            }
          }
        }
      }
      this.logger.log(`Citas próximas analizadas. ${count} recordatorios enviados.`);
    } catch (error) {
      this.logger.error('Error procesando recordatorios de citas', error);
    }
  }

  private async processVaccineReminders() {
    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);
    in7Days.setHours(0, 0, 0, 0);
    const endOf7Days = new Date(in7Days);
    endOf7Days.setHours(23, 59, 59, 999);

    try {
      const vaccinations = await this.prisma.vaccination.findMany({
        where: {
          nextDueDate: {
            gte: in7Days,
            lte: endOf7Days,
          },
        },
        include: {
          pet: {
            include: { client: true },
          },
        },
      });

      let count = 0;
      for (const vax of vaccinations) {
        const existingLog = await this.prisma.notificationLog.findFirst({
          where: {
            referenceId: vax.id,
            type: 'VACCINE',
            status: 'SENT',
          },
        });

        if (!existingLog) {
          const email = vax.pet.client.email;
          if (email) {
            const success = await this.mailService.sendVaccineReminder(
              email,
              `${vax.pet.client.firstName} ${vax.pet.client.lastName}`,
              vax.vaccineName,
              vax.pet.name
            );

            if (success) {
              await this.prisma.notificationLog.create({
                data: {
                  type: 'VACCINE',
                  channel: 'EMAIL',
                  recipient: email,
                  status: 'SENT',
                  referenceId: vax.id,
                },
              });
              count++;
            }
          }
        }
      }
      this.logger.log(`Vacunas próximas analizadas. ${count} alertas enviadas.`);
    } catch (error) {
      this.logger.error('Error procesando recordatorios de vacunas', error);
    }
  }

  private async processFollowUpReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    try {
      const followUps = await this.prisma.medicalRecord.findMany({
        where: {
          followUpDate: {
            gte: tomorrow,
            lte: endOfTomorrow,
          },
          dischargedAt: null,
        },
        include: {
          pet: {
            include: { client: true },
          },
        },
      });

      let count = 0;
      for (const record of followUps) {
        const existingLog = await this.prisma.notificationLog.findFirst({
          where: {
            referenceId: record.id,
            type: 'FOLLOW_UP',
            status: 'SENT',
          },
        });

        if (!existingLog) {
          const email = record.pet.client.email;
          if (email) {
            this.logger.log(
              `[EMAIL LOG] Recordatorio de seguimiento a ${email} para ${record.pet.name}`,
            );

            await this.prisma.notificationLog.create({
              data: {
                type: 'FOLLOW_UP',
                channel: 'EMAIL',
                recipient: email,
                status: 'SENT',
                referenceId: record.id,
              },
            });
            count++;
          }
        }
      }
      this.logger.log(`Seguimientos próximos analizados. ${count} recordatorios enviados.`);
    } catch (error) {
      this.logger.error('Error procesando recordatorios de seguimiento', error);
    }
  }
}
