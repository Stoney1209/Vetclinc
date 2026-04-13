import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { PdfReceiptService } from './pdf-receipt.service';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [InventoryModule],
  controllers: [SalesController],
  providers: [SalesService, PdfReceiptService],
  exports: [SalesService],
})
export class SalesModule {}
