import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class PdfReceiptService {
  constructor(private prisma: PrismaService) {}

  async generateReceipt(saleId: string): Promise<PDFKit.PDFDocument> {
    const sale = await this.prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException('Venta no encontrada');
    }

    const [client, user] = await Promise.all([
      sale.clientId ? this.prisma.client.findUnique({ where: { id: sale.clientId } }) : null,
      this.prisma.user.findUnique({ where: { id: sale.userId } }),
    ]);

    const doc = new PDFDocument({ margin: 50 });

    doc.fontSize(20).text('VetClinic Pro', { align: 'center' });
    doc.fontSize(10).text('Recibo de Venta', { align: 'center' });
    doc.moveDown();

    const y = 140;
    doc.fontSize(10);
    doc.text(`Folio: ${sale.id.slice(0, 8).toUpperCase()}`, 50, y);
    doc.text(`Fecha: ${sale.createdAt.toLocaleDateString('es-MX')}`, 400, y);

    let currentY = y + 20;
    if (client) {
      doc.text(`Cliente: ${client.firstName} ${client.lastName}`, 50, currentY);
      currentY += 15;
      if (client.phone) {
        doc.text(`Teléfono: ${client.phone}`, 50, currentY);
        currentY += 15;
      }
    }
    doc.text(`Atendió: ${user?.firstName || 'Sistema'}`, 50, currentY);
    currentY += 30;

    doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
    currentY += 20;

    doc.fontSize(11).text('Concepto', 50, currentY);
    doc.text('Cant.', 320, currentY);
    doc.text('P.U.', 370, currentY);
    doc.text('Importe', 450, currentY);
    currentY += 10;
    doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
    currentY += 15;

    doc.fontSize(10);
    for (const item of sale.items) {
      const name = item.product.name.length > 25 
        ? item.product.name.slice(0, 25) + '...' 
        : item.product.name;
      doc.text(name, 50, currentY);
      doc.text(item.quantity.toString(), 320, currentY);
      doc.text(`$${Number(item.unitPrice).toFixed(2)}`, 370, currentY);
      doc.text(`$${Number(item.subtotal).toFixed(2)}`, 450, currentY);
      currentY += 18;
    }

    currentY += 10;
    doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
    currentY += 20;

    doc.fontSize(10);
    doc.text('Subtotal:', 350, currentY);
    doc.text(`$${Number(sale.subtotal).toFixed(2)}`, 450, currentY);
    currentY += 15;

    doc.text('IVA (16%):', 350, currentY);
    doc.text(`$${Number(sale.tax).toFixed(2)}`, 450, currentY);
    currentY += 20;

    doc.fontSize(12).text('TOTAL:', 350, currentY);
    doc.text(`$${Number(sale.total).toFixed(2)}`, 450, currentY);
    currentY += 30;

    doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
    currentY += 20;

    doc.fontSize(10).text(`Método de pago: ${sale.paymentMethod || 'Efectivo'}`, 50, currentY);
    currentY += 15;
    doc.text(`Estado: ${sale.status === 'cancelled' ? 'CANCELADA' : 'COMPLETADA'}`, 50, currentY);
    currentY += 30;

    doc.fontSize(9).text('Gracias por su preferencia', { align: 'center' });
    doc.fontSize(8).text('VetClinic Pro - Sistema de Gestión Veterinaria', { align: 'center' });

    return doc;
  }
}