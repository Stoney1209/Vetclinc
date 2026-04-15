import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSaleDto } from './dto/sales.dto';
import { PdfService } from './pdf.service';
import { MailService } from '../notifications/mail.service';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private mailService: MailService,
  ) {}

  async create(dto: CreateSaleDto, userId: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('La venta debe tener al menos un producto');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Validar cliente (Opcional)
      if (dto.clientId) {
        const client = await tx.client.findUnique({ where: { id: dto.clientId } });
        if (!client) throw new NotFoundException('Cliente no encontrado');
      }

      // 2. Procesar items y actualizar stock
      let subtotal = 0;
      const itemsData = [];

      for (const item of dto.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new BadRequestException(`Producto ${item.productId} no encontrado`);
        if (product.stock < item.quantity) {
          throw new BadRequestException(`Stock insuficiente para ${product.name}`);
        }

        const price = Number(product.price);
        const itemSubtotal = price * item.quantity;
        subtotal += itemSubtotal;

        itemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: price,
          subtotal: itemSubtotal,
        });

        // Descontar stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const tax = subtotal * 0.16;
      const total = subtotal + tax;

      // 3. Crear la venta
      const sale = await tx.sale.create({
        data: {
          clientId: dto.clientId || null,
          userId: userId,
          subtotal: subtotal,
          tax: tax,
          total: total,
          paymentMethod: dto.paymentMethod,
          status: 'completed',
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

      // 4. Generar y enviar recibo por email (Asíncrono)
      this.generateAndSendReceipt(sale).catch((err) => 
        this.logger.error(`Error en proceso de recibo para venta ${sale.id}:`, err)
      );

      return sale;
    });
  }

  async cancel(id: string) {
    const sale = await this.findOne(id);
    if (sale.status === 'cancelled') {
      throw new BadRequestException('La venta ya está cancelada');
    }

    return this.prisma.$transaction(async (tx) => {
      // Restaurar stock
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return tx.sale.update({
        where: { id },
        data: { status: 'cancelled' },
      });
    });
  }

  private async generateAndSendReceipt(sale: any) {
    try {
      if (!sale.client || !sale.client.email) return;

      const pdfBuffer = await this.pdfService.generateSaleReceipt(sale);
      await this.mailService.sendSaleReceipt(
        sale.client.email,
        `${sale.client.firstName} ${sale.client.lastName}`,
        pdfBuffer,
        sale.id
      );
    } catch (error) {
      this.logger.error(`Falló el envío de recibo para venta ${sale.id}`, error);
    }
  }

  async findAll(startDate?: Date, endDate?: Date, pagination?: PaginationDto) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.SaleWhereInput = {
      ...(startDate || endDate ? {
        createdAt: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        }
      } : {}),
    };

    const [sales, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        include: {
          client: true,
          items: { include: { product: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.sale.count({ where }),
    ]);

    return paginate(
      sales.map(s => ({ 
        ...s, 
        total: Number(s.total),
        subtotal: Number(s.subtotal),
        tax: Number(s.tax)
      })),
      total,
      page,
      limit
    );
  }

  async findOne(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        client: true,
        items: { include: { product: true } },
      },
    });

    if (!sale) throw new NotFoundException('Venta no encontrada');
    
    return {
      ...sale,
      total: Number(sale.total),
      subtotal: Number(sale.subtotal),
      tax: Number(sale.tax),
      items: sale.items.map(item => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      }))
    };
  }

  async getDailySummary(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const where = {
      createdAt: { gte: startOfDay, lte: endOfDay },
      status: 'completed',
    };

    const [aggregate, count, grouped, itemsCount] = await Promise.all([
      this.prisma.sale.aggregate({
        where,
        _sum: { total: true, tax: true },
      }),
      this.prisma.sale.count({ where }),
      this.prisma.sale.groupBy({
        by: ['paymentMethod'],
        where,
        _sum: { total: true },
      }),
      this.prisma.saleItem.count({
        where: { sale: where },
      }),
    ]);

    const salesByPayment = grouped.reduce((acc, curr) => {
      acc[curr.paymentMethod || 'UNKNOWN'] = Number(curr._sum.total || 0);
      return acc;
    }, {} as Record<string, number>);

    return {
      salesCount: count,
      totalSales: Number(aggregate._sum.total || 0),
      totalTax: Number(aggregate._sum.tax || 0),
      totalItems: itemsCount,
      salesByPayment,
    };
  }
}
