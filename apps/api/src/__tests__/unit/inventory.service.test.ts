import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InventoryService } from '../../modules/inventory/inventory.service';
import { NotificationGateway } from '../../modules/notifications/notification.gateway';
import { PrismaService } from '../../database/prisma.service';
import { createMockProduct } from '../mocks/prisma.mock';

describe('InventoryService', () => {
  let inventoryService: InventoryService;
  let prismaService: any;
  let notificationGateway: any;

  const mockProduct = createMockProduct({
    id: 'product-123',
    name: 'Test Product',
    price: 100,
    cost: 50,
    stock: 20,
    minStock: 5,
    isActive: true,
  });

  beforeEach(async () => {
    prismaService = {
      product: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        fields: { minStock: { minStock: 'minStock' } },
      },
      category: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      $transaction: jest.fn(async (cb) => cb(prismaService)),
    };

    notificationGateway = {
      emitLowStockAlert: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: prismaService },
        { provide: NotificationGateway, useValue: notificationGateway },
      ],
    }).compile();

    inventoryService = module.get<InventoryService>(InventoryService);
    prismaService = module.get(PrismaService);
    notificationGateway = module.get(NotificationGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      prismaService.product.findMany.mockResolvedValue([mockProduct]);
      prismaService.product.count.mockResolvedValue(1);

      const result = await inventoryService.findAll();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result.total).toBe(1);
      expect(result.data[0].name).toBe('Test Product');
    });

    it('should filter by category', async () => {
      prismaService.product.findMany.mockResolvedValue([mockProduct]);
      prismaService.product.count.mockResolvedValue(1);

      await inventoryService.findAll('category-123');

      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { categoryId: 'category-123', isActive: true },
        }),
      );
    });

    it('should convert Decimal price and cost to numbers', async () => {
      const productWithDecimals = {
        ...mockProduct,
        price: { toNumber: () => 100 },
        cost: { toNumber: () => 50 },
      };
      prismaService.product.findMany.mockResolvedValue([productWithDecimals]);
      prismaService.product.count.mockResolvedValue(1);

      const result = await inventoryService.findAll();

      expect(typeof result.data[0].price).toBe('number');
      expect(typeof result.data[0].cost).toBe('number');
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      prismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await inventoryService.findOne('product-123');

      expect(result.id).toBe('product-123');
      expect(result.name).toBe('Test Product');
    });

    it('should throw NotFoundException when product not found', async () => {
      prismaService.product.findUnique.mockResolvedValue(null);

      await expect(
        inventoryService.findOne('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLowStock', () => {
    it('should return products with low stock', async () => {
      const lowStockProduct = { ...mockProduct, stock: 3, status: 'LOW_STOCK' };
      prismaService.product.findMany.mockResolvedValue([lowStockProduct]);

      const result = await inventoryService.getLowStock();

      expect(result.length).toBe(1);
      expect(result[0].stock).toBeLessThanOrEqual(5);
    });

    it('should include products with OUT_OF_STOCK status', async () => {
      prismaService.product.findMany.mockResolvedValue([]);

      await inventoryService.getLowStock();

      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
        }),
      );
    });
  });

  describe('getExpiring', () => {
    it('should return products expiring within specified days', async () => {
      const expiringProduct = {
        ...mockProduct,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
      prismaService.product.findMany.mockResolvedValue([expiringProduct]);

      const result = await inventoryService.getExpiring(30);

      expect(result.length).toBe(1);
    });

    it('should default to 30 days if no parameter provided', async () => {
      prismaService.product.findMany.mockResolvedValue([]);

      await inventoryService.getExpiring();

      expect(prismaService.product.findMany).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    const createProductDto = {
      name: 'New Product',
      sku: 'NEW-001',
      price: 100,
      cost: 50,
      stock: 20,
      minStock: 5,
      categoryId: 'category-123',
    };

    it('should create a product successfully', async () => {
      const category = { id: 'category-123', name: 'Medicamentos' };
      prismaService.category.findUnique.mockResolvedValue(category);
      prismaService.product.create.mockResolvedValue({
        ...createProductDto,
        id: 'new-product-id',
      });

      const result = await inventoryService.create(createProductDto);

      expect(result).toHaveProperty('id');
      expect(prismaService.product.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException for non-existent category', async () => {
      prismaService.category.findUnique.mockResolvedValue(null);

      await expect(
        inventoryService.create(createProductDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a product successfully', async () => {
      prismaService.product.findUnique.mockResolvedValue(mockProduct);
      prismaService.product.update.mockResolvedValue({
        ...mockProduct,
        name: 'Updated Name',
      });

      const result = await inventoryService.update('product-123', {
        name: 'Updated Name',
      });

      expect(result.name).toBe('Updated Name');
    });

    it('should throw NotFoundException for non-existent product', async () => {
      prismaService.product.findUnique.mockResolvedValue(null);

      await expect(
        inventoryService.update('non-existent', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('adjustStock', () => {
    it('should increase stock with positive adjustment', async () => {
      prismaService.product.findUnique.mockResolvedValue(mockProduct);
      prismaService.product.update.mockResolvedValue({
        ...mockProduct,
        stock: 25,
      });

      const result = await inventoryService.adjustStock('product-123', {
        adjustment: 5,
      });

      expect(result.stock).toBe(25);
    });

    it('should decrease stock with negative adjustment', async () => {
      prismaService.product.findUnique.mockResolvedValue(mockProduct);
      prismaService.product.update.mockResolvedValue({
        ...mockProduct,
        stock: 15,
      });

      const result = await inventoryService.adjustStock('product-123', {
        adjustment: -5,
      });

      expect(result.stock).toBe(15);
    });

    it('should throw BadRequestException when resulting stock is negative', async () => {
      prismaService.product.findUnique.mockResolvedValue(mockProduct);

      await expect(
        inventoryService.adjustStock('product-123', { adjustment: -100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should emit low stock alert when stock drops below minimum', async () => {
      const productAtMinStock = { ...mockProduct, stock: 6, minStock: 5 };
      prismaService.product.findUnique.mockResolvedValue(productAtMinStock);
      prismaService.product.update.mockResolvedValue({
        ...productAtMinStock,
        stock: 1,
        status: 'LOW_STOCK',
      });

      await inventoryService.adjustStock('product-123', { adjustment: -5 });

      expect(notificationGateway.emitLowStockAlert).toHaveBeenCalled();
    });

    it('should set OUT_OF_STOCK status when stock reaches zero', async () => {
      const productWithLittleStock = { ...mockProduct, stock: 1 };
      prismaService.product.findUnique.mockResolvedValue(productWithLittleStock);
      prismaService.product.update.mockResolvedValue({
        ...productWithLittleStock,
        stock: 0,
        status: 'OUT_OF_STOCK',
      });

      await inventoryService.adjustStock('product-123', { adjustment: -1 });

      expect(prismaService.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            stock: { increment: -1 },
            status: 'OUT_OF_STOCK',
          }),
        }),
      );
    });
  });

  describe('getCategories', () => {
    it('should return all categories', async () => {
      const categories = [
        { id: 'cat-1', name: 'Medicamentos' },
        { id: 'cat-2', name: 'Alimentos' },
      ];
      prismaService.category.findMany.mockResolvedValue(categories);

      const result = await inventoryService.getCategories();

      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Medicamentos');
    });

    it('should order categories by name', async () => {
      prismaService.category.findMany.mockResolvedValue([]);

      await inventoryService.getCategories();

      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('createCategory', () => {
    it('should create a category successfully', async () => {
      const newCategory = { id: 'new-cat', name: 'Nueva Categoría' };
      prismaService.category.create.mockResolvedValue(newCategory);

      const result = await inventoryService.createCategory('Nueva Categoría', 'type');

      expect(result.id).toBe('new-cat');
      expect(prismaService.category.create).toHaveBeenCalledWith({
        data: { name: 'Nueva Categoría', type: 'type' },
      });
    });
  });
});
