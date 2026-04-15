import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSaleDto } from './dto/sales.dto';
import { PdfService } from './pdf.service';
import { MailService } from '../notifications/mail.service';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private mailService: MailService,
  ) {}

  async create(dto: CreateSaleDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Validar cliente
      const client = await tx.client.findUnique({ where: { id: dto.clientId } });
      if (!client) throw new NotFoundException('Cliente no encontrado');

      // 2. Procesar items y actualizar stock
      let total = 0;
      const itemsData = [];

      for (const item of dto.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new NotFoundException(`Producto ${item.productId} no encontrado`);
        if (product.stock < item.quantity) {
          throw new BadRequestException(`Stock insuficiente para ${product.name}`);
        }

        const price = Number(product.price);
        const subtotal = price * item.quantity;
        total += subtotal;

        itemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: price,
        });

        // Descontar stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 3. Crear la venta
      const sale = await tx.sale.create({
        data: {
          clientId: dto.clientId,
          total: total,
          paymentMethod: dto.paymentMethod,
          items: {
            create: itemsData,
          },
        },
        include: {
          client: true,
          items: {
            include: { product: true },
          },
        },
      });

      // 4. Generar y enviar recibo por email (Asíncrono para no bloquear la respuesta)
      this.generateAndSendReceipt(sale).catch((err) => 
        this.logger.error(`Error en proceso de recibo para venta ${sale.id}:`, err)
      );

      return sale;
    });
  }

  private async generateAndSendReceipt(sale: any) {
    try {
      if (!sale.client.email) return;

      const pdfBuffer = await this.pdfService.generateSaleReceipt(sale);
      await this.mailService.sendSaleReceipt(
        sale.client.email,
        `${sale.client.firstName} ${sale.client.lastName}`,
        pdfBuffer,
        sale.id
      );
      this.logger.log(`Recibo enviado a ${sale.client.email} para venta ${sale.id}`);
    } catch (error) {
      this.logger.error(`Falló el envío de recibo para venta ${sale.id}`, error);
    }
  }

  async findAll() {
    return this.prisma.sale.findMany({
      include: {
        client: true,
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        client: true,
        items: {
          include: { product: true },
        },
      },
    });

    if (!sale) throw new NotFoundException('Venta no encontrada');
    return sale;
  }
}
