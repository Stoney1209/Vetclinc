import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { NotificationModule } from '../notifications/notification.module';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [NotificationModule, PrismaModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
