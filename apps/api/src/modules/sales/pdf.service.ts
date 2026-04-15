import { Injectable } from '@nestjs/common';
const PDFDocument = require('pdfkit');

@Injectable()
export class PdfService {
  async generateSaleReceipt(sale: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Header - Logo and Title
      doc
        .fillColor('#10b981')
        .fontSize(20)
        .text('VETCLINIC PRO', { align: 'right' })
        .fontSize(10)
        .fillColor('#666')
        .text('Software de Gestión Veterinaria', { align: 'right' })
        .moveDown();

      // Horizontal Line
      doc
        .strokeColor('#eee')
        .lineWidth(1)
        .moveTo(50, 100)
        .lineTo(550, 100)
        .stroke();

      // Invoice Details
      doc
        .fillColor('#000')
        .fontSize(16)
        .text('RECIBO DE VENTA', 50, 120)
        .fontSize(10)
        .text(`Folio: ${sale.id.slice(0, 8).toUpperCase()}`, 50, 140)
        .text(`Fecha: ${new Date(sale.createdAt).toLocaleString('es-ES')}`, 50, 155)
        .moveDown();

      // Client Info
      doc
        .fontSize(12)
        .text('Cliente:', 50, 190)
        .fontSize(10)
        .fillColor('#333')
        .text(`${sale.client.firstName} ${sale.client.lastName}`, 50, 205)
        .text(sale.client.email || 'N/A', 50, 218)
        .moveDown();

      // Table Header
      const tableTop = 260;
      doc
        .fillColor('#f9fafb')
        .rect(50, tableTop, 500, 20)
        .fill()
        .fillColor('#374151')
        .fontSize(10)
        .text('Descripción', 60, tableTop + 5)
        .text('Cant.', 300, tableTop + 5)
        .text('Precio Unit.', 380, tableTop + 5)
        .text('Total', 480, tableTop + 5);

      // Table Rows
      let currentY = tableTop + 25;
      sale.items.forEach((item: any) => {
        doc
          .fillColor('#333')
          .text(item.product?.name || 'Servicio/Otro', 60, currentY)
          .text(item.quantity.toString(), 300, currentY)
          .text(`$${Number(item.price).toFixed(2)}`, 380, currentY)
          .text(`$${(item.quantity * Number(item.price)).toFixed(2)}`, 480, currentY);
        
        currentY += 20;
      });

      // Horizontal Line
      doc
        .strokeColor('#eee')
        .moveTo(50, currentY + 10)
        .lineTo(550, currentY + 10)
        .stroke();

      // Totals
      const totalY = currentY + 30;
      doc
        .fontSize(14)
        .fillColor('#111827')
        .text(`SUBTOTAL:`, 380, totalY - 40)
        .text(`$${Number(sale.subtotal).toFixed(2)}`, 480, totalY - 40, { align: 'right', width: 70 })
        .text(`IVA (16%):`, 380, totalY - 20)
        .text(`$${Number(sale.tax).toFixed(2)}`, 480, totalY - 20, { align: 'right', width: 70 })
        .text(`TOTAL:`, 380, totalY)
        .text(`$${Number(sale.total).toFixed(2)}`, 480, totalY, { align: 'right', width: 70 });

      // Footer
      const footerY = 700;
      doc
        .fontSize(10)
        .fillColor('#9ca3af')
        .text('Gracias por confiar la salud de tu mascota con nosotros.', 50, footerY, { align: 'center', width: 500 })
        .text('Este documento es un comprobante de pago no fiscal.', 50, footerY + 15, { align: 'center', width: 500 });

      doc.end();
    });
  }
}
