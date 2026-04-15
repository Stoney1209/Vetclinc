import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { PdfService } from './pdf.service';
import { PrismaModule } from '../../database/prisma.module';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [SalesController],
  providers: [SalesService, PdfService],
  exports: [SalesService],
})
export class SalesModule {}
