import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateSaleDto } from './dto/sales.dto';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async findAll(startDate?: Date, endDate?: Date, pagination?: PaginationDto) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.SaleWhereInput = {};

    if (startDate && endDate) {
      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    const [sales, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.sale.count({ where }),
    ]);

    return paginate(
      sales.map((s) => ({
        ...s,
        subtotal: Number(s.subtotal),
        tax: Number(s.tax),
        total: Number(s.total),
        items: s.items.map((i) => ({
          ...i,
          unitPrice: Number(i.unitPrice),
          subtotal: Number(i.subtotal),
        })),
      })),
      total,
      page,
      limit,
    );
  }

  async findOne(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
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

    return {
      ...sale,
      subtotal: Number(sale.subtotal),
      tax: Number(sale.tax),
      total: Number(sale.total),
      items: sale.items.map((i) => ({
        ...i,
        unitPrice: Number(i.unitPrice),
        subtotal: Number(i.subtotal),
      })),
    };
  }

  async create(dto: CreateSaleDto, userId: string) {
    if (dto.items.length === 0) {
      throw new BadRequestException('La venta debe tener al menos un producto');
    }

    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('Algunos productos no fueron encontrados');
    }

    for (const item of dto.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para ${product.name}. Disponible: ${product.stock}`,
        );
      }
    }

    const itemsWithPrices = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: Number(product.price) * item.quantity,
      };
    });

    const subtotal = itemsWithPrices.reduce((sum, i) => sum + i.subtotal, 0);
    const taxRate = 0.16;
    const tax = Number((subtotal * taxRate).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));

    const sale = await this.prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          subtotal,
          tax,
          total,
          paymentMethod: dto.paymentMethod,
          status: 'completed',
          userId,
          clientId: dto.clientId,
          items: {
            create: itemsWithPrices,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      for (const item of dto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      return newSale;
    });

    return {
      ...sale,
      subtotal: Number(sale.subtotal),
      tax: Number(sale.tax),
      total: Number(sale.total),
      items: sale.items.map((i) => ({
        ...i,
        unitPrice: Number(i.unitPrice),
        subtotal: Number(i.subtotal),
      })),
    };
  }

  async getDailySummary(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const where = {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: 'completed',
    };

    const [aggregation, salesCount, salesByPayment] = await Promise.all([
      this.prisma.sale.aggregate({
        where,
        _sum: {
          total: true,
          tax: true,
        },
      }),
      this.prisma.sale.count({ where }),
      this.prisma.sale.groupBy({
        by: ['paymentMethod'],
        where,
        _sum: {
          total: true,
        },
      }),
    ]);

    const paymentMap: Record<string, number> = {};
    for (const item of salesByPayment) {
      const method = item.paymentMethod || 'cash';
      paymentMap[method] = Number(item._sum.total || 0);
    }

    const totalItems = await this.prisma.saleItem.count({
      where: {
        sale: where,
      },
    });

    return {
      date: date.toISOString().split('T')[0],
      totalSales: Number(aggregation._sum.total || 0),
      totalTax: Number(aggregation._sum.tax || 0),
      totalItems,
      salesCount,
      salesByPayment: paymentMap,
    };
  }

  async cancel(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException('Venta no encontrada');
    }

    if (sale.status === 'cancelled') {
      throw new BadRequestException('La venta ya está cancelada');
    }

    return this.prisma.$transaction(async (tx) => {
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
          },
        });
      }

      return tx.sale.update({
        where: { id },
        data: { status: 'cancelled' },
        include: {
          items: true,
        },
      });
    });
  }
}
