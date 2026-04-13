import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationGateway } from '../notifications/notification.gateway';
import { CreateProductDto, UpdateProductDto, AdjustStockDto } from './dto/inventory.dto';
import { StockStatus } from '@prisma/client';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway,
  ) {}

  async findAll(categoryId?: string, pagination?: PaginationDto) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = {
      ...(categoryId ? { categoryId } : {}),
      isActive: true,
      ...(pagination?.search && {
        OR: [
          { name: { contains: pagination.search, mode: 'insensitive' } },
          { sku: { contains: pagination.search, mode: 'insensitive' } },
          { description: { contains: pagination.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return paginate(
      products.map((p) => ({
        ...p,
        price: Number(p.price),
        cost: p.cost ? Number(p.cost) : null,
      })),
      total,
      page,
      limit,
    );
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('Producto no encontrado');
    }

    return {
      ...product,
      price: Number(product.price),
      cost: product.cost ? Number(product.cost) : null,
    };
  }

  async getLowStock() {
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: { category: true },
    });

    const lowStockProducts = products.filter(
      (p) => p.stock <= p.minStock || p.status === 'LOW_STOCK'
    );

    return lowStockProducts.map((p) => ({
      ...p,
      price: Number(p.price),
      cost: p.cost ? Number(p.cost) : null,
    }));
  }

  async getExpiring(days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        expiryDate: {
          lte: futureDate,
          gte: new Date(),
        },
      },
      include: { category: true },
      orderBy: { expiryDate: 'asc' },
    });

    return products.map((p) => ({
      ...p,
      price: Number(p.price),
      cost: p.cost ? Number(p.cost) : null,
    }));
  }

  async create(dto: CreateProductDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new BadRequestException('Categoría no encontrada');
    }

    return this.prisma.product.create({
      data: {
        name: dto.name,
        sku: dto.sku,
        description: dto.description,
        price: dto.price,
        cost: dto.cost,
        stock: dto.stock,
        minStock: dto.minStock,
        categoryId: dto.categoryId,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
        batch: dto.batch,
      },
      include: { category: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        ...(dto.sku !== undefined && { sku: dto.sku }),
        description: dto.description,
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.cost !== undefined && { cost: dto.cost }),
        minStock: dto.minStock,
        ...(dto.expiryDate !== undefined && { expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null }),
      },
      include: { category: true },
    });
  }

  async adjustStock(id: string, dto: AdjustStockDto) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id } });
      if (!product || !product.isActive) {
        throw new NotFoundException('Producto no encontrado');
      }

      const newStock = product.stock + dto.adjustment;

      if (newStock < 0) {
        throw new BadRequestException('El stock no puede ser negativo');
      }

      let status: StockStatus = 'IN_STOCK';
      if (newStock === 0) {
        status = 'OUT_OF_STOCK';
      } else if (newStock <= (product.minStock || 5)) {
        status = 'LOW_STOCK';
        this.notificationGateway.emitLowStockAlert({
          ...product,
          stock: newStock,
          status,
        });
      }

      return tx.product.update({
        where: { id },
        data: {
          stock: { increment: dto.adjustment },
          status,
        },
        include: { category: true },
      });
    });
  }

  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(name: string, type: string) {
    return this.prisma.category.create({
      data: { name, type },
    });
  }

  async delete(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product || !product.isActive) {
      throw new NotFoundException('Producto no encontrado');
    }

    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
