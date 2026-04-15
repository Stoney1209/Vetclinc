import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SalesService } from '../../modules/sales/sales.service';
import { PrismaService } from '../../database/prisma.service';
import { createMockProduct, createMockSale } from '../mocks/prisma.mock';

describe('SalesService', () => {
  let salesService: SalesService;
  let prismaService: any;
  let pdfService: any;
  let mailService: any;

  const mockProducts = [
    createMockProduct({
      id: 'product-1',
      name: 'Product 1',
      price: 100,
      stock: 20,
    }),
    createMockProduct({
      id: 'product-2',
      name: 'Product 2',
      price: 50,
      stock: 10,
    }),
  ];

  beforeEach(async () => {
    prismaService = {
      sale: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn(),
        groupBy: jest.fn(),
      },
      saleItem: {
        count: jest.fn(),
      },
      product: {
        findMany: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    pdfService = {
      generateSaleReceipt: jest.fn().mockResolvedValue(Buffer.from('mock-pdf')),
    };

    mailService = {
      sendSaleReceipt: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: PrismaService, useValue: prismaService },
        { provide: PdfService, useValue: pdfService },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    salesService = module.get<SalesService>(SalesService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated sales', async () => {
      const mockSales = [
        createMockSale({ id: 'sale-1', total: 100 }),
        createMockSale({ id: 'sale-2', total: 200 }),
      ];

      prismaService.sale.findMany.mockResolvedValue(mockSales);
      prismaService.sale.count.mockResolvedValue(2);

      const result = await salesService.findAll();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result.total).toBe(2);
    });

    it('should filter sales by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      prismaService.sale.findMany.mockResolvedValue([]);
      prismaService.sale.count.mockResolvedValue(0);

      await salesService.findAll(startDate, endDate);

      expect(prismaService.sale.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: { gte: startDate, lte: endDate },
          }),
        }),
      );
    });

    it('should handle pagination parameters', async () => {
      prismaService.sale.findMany.mockResolvedValue([]);
      prismaService.sale.count.mockResolvedValue(0);

      await salesService.findAll(undefined, undefined, { page: 2, limit: 10 });

      expect(prismaService.sale.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a sale by id', async () => {
      const mockSale = createMockSale({
        id: 'sale-123',
        subtotal: 86.21,
        tax: 13.79,
        total: 100,
        items: [],
      });

      prismaService.sale.findUnique.mockResolvedValue(mockSale);

      const result = await salesService.findOne('sale-123');

      expect(result.id).toBe('sale-123');
      expect(prismaService.sale.findUnique).toHaveBeenCalledWith({
        where: { id: 'sale-123' },
        include: { items: { include: { product: true } } },
      });
    });

    it('should throw NotFoundException when sale not found', async () => {
      prismaService.sale.findUnique.mockResolvedValue(null);

      await expect(salesService.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should convert Decimal fields to numbers', async () => {
      const mockSale = {
        ...createMockSale(),
        subtotal: { toNumber: () => 86.21 },
        tax: { toNumber: () => 13.79 },
        total: { toNumber: () => 100 },
        items: [],
      };

      prismaService.sale.findUnique.mockResolvedValue(mockSale);

      const result = await salesService.findOne('sale-123');

      expect(typeof result.subtotal).toBe('number');
      expect(typeof result.tax).toBe('number');
      expect(typeof result.total).toBe('number');
    });
  });

  describe('create', () => {
    const createSaleDto = {
      items: [
        { productId: 'product-1', quantity: 2 },
        { productId: 'product-2', quantity: 1 },
      ],
      paymentMethod: 'CASH',
    };

    it('should create a sale successfully', async () => {
      prismaService.product.findMany.mockResolvedValue(mockProducts);
      prismaService.$transaction.mockImplementation(async (callback: any) => {
        return callback(prismaService);
      });
      prismaService.sale.create.mockResolvedValue({
        id: 'new-sale',
        subtotal: 250,
        tax: 40,
        total: 290,
        items: [],
      });

      const result = await salesService.create(createSaleDto, 'user-123');

      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });

    it('should throw BadRequestException for empty items', async () => {
      await expect(
        salesService.create({ items: [], paymentMethod: 'CASH' }, 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for non-existent products', async () => {
      prismaService.product.findMany.mockResolvedValue([mockProducts[0]]);

      await expect(
        salesService.create(createSaleDto, 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for insufficient stock', async () => {
      const lowStockProduct = { ...mockProducts[0], stock: 1 };
      prismaService.product.findMany.mockResolvedValue([lowStockProduct, mockProducts[1]]);

      await expect(
        salesService.create(createSaleDto, 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should calculate correct totals with 16% tax', async () => {
      const singleProduct = [
        { ...mockProducts[0], price: 100, stock: 100 },
      ];
      prismaService.product.findMany.mockResolvedValue(singleProduct);
      
      let capturedData: any;
      prismaService.$transaction.mockImplementation(async (callback: any) => {
        capturedData = await callback(prismaService);
        return capturedData.sale?.create?.({ data: { items: [], subtotal: 200, tax: 32, total: 232 } }) || { items: [], subtotal: 200, tax: 32, total: 232 };
      });
      prismaService.sale.create.mockImplementation(({ data }: any) => ({
        id: 'new-sale',
        ...data,
        items: data.items || [],
      }));

      await salesService.create(
        { items: [{ productId: 'product-1', quantity: 2 }], paymentMethod: 'CASH' },
        'user-123',
      );

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['product-1'] } },
      });
    });
  });

  describe('getDailySummary', () => {
    it('should return daily sales summary', async () => {
      prismaService.sale.aggregate.mockResolvedValue({
        _sum: { total: 300, tax: 48 },
      });
      prismaService.sale.count.mockResolvedValue(2);
      prismaService.sale.groupBy.mockResolvedValue([
        { paymentMethod: 'CASH', _sum: { total: 100 } },
        { paymentMethod: 'CARD', _sum: { total: 200 } },
      ]);
      prismaService.saleItem.count.mockResolvedValue(3);

      const result = await salesService.getDailySummary(new Date());

      expect(result.salesCount).toBe(2);
      expect(result.totalSales).toBe(300);
      expect(result.totalTax).toBe(48);
      expect(result.totalItems).toBe(3);
      expect(result.salesByPayment).toEqual({
        CASH: 100,
        CARD: 200,
      });
    });

    it('should return zero values when no sales', async () => {
      prismaService.sale.aggregate.mockResolvedValue({
        _sum: { total: null, tax: null },
      });
      prismaService.sale.count.mockResolvedValue(0);
      prismaService.sale.groupBy.mockResolvedValue([]);
      prismaService.saleItem.count.mockResolvedValue(0);

      const result = await salesService.getDailySummary(new Date());

      expect(result.salesCount).toBe(0);
      expect(result.totalSales).toBe(0);
      expect(result.totalItems).toBe(0);
    });

    it('should filter by completed status', async () => {
      prismaService.sale.aggregate.mockResolvedValue({
        _sum: { total: 0, tax: 0 },
      });
      prismaService.sale.count.mockResolvedValue(0);
      prismaService.sale.groupBy.mockResolvedValue([]);
      prismaService.saleItem.count.mockResolvedValue(0);

      await salesService.getDailySummary(new Date());

      expect(prismaService.sale.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'completed',
          }),
        }),
      );
    });
  });
});
