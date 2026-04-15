import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../database/prisma.module';
import { MailService } from './mail.service';
import { RemindersService } from './reminders.service';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [MailService, RemindersService, NotificationGateway, NotificationService],
  exports: [MailService, RemindersService, NotificationGateway, NotificationService],
})
export class NotificationModule {}
