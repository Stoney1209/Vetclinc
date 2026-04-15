import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../database/prisma.module';
import { MailService } from './mail.service';
import { RemindersService } from './reminders.service';
import { NotificationGateway } from './notification.gateway';

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [MailService, RemindersService, NotificationGateway],
  exports: [MailService, RemindersService, NotificationGateway],
})
export class NotificationModule {}
