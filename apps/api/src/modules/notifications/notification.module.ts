import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../database/prisma.module';
import { NotificationGateway } from './notification.gateway';
import { RemindersService } from './reminders.service';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [NotificationGateway, RemindersService, NotificationService],
  exports: [NotificationGateway, RemindersService, NotificationService],
})
export class NotificationModule {}
