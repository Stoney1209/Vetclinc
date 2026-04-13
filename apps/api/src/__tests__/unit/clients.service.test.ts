import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ClientsService } from '../../modules/clients/clients.service';
import { PrismaService } from '../../database/prisma.service';
import { createMockClient } from '../mocks/prisma.mock';

describe('ClientsService', () => {
  let clientsService: ClientsService;
  let prismaService: any;

  const mockClient = createMockClient({
    id: 'client-123',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@example.com',
    phone: '5551234567',
    pets: [],
  });

  beforeEach(async () => {
    prismaService = {
      client: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    clientsService = module.get<ClientsService>(ClientsService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated clients', async () => {
      prismaService.client.findMany.mockResolvedValue([mockClient]);
      prismaService.client.count.mockResolvedValue(1);

      const result = await clientsService.findAll();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result.total).toBe(1);
      expect(result.data[0].firstName).toBe('Juan');
    });

    it('should filter only active clients', async () => {
      prismaService.client.findMany.mockResolvedValue([mockClient]);
      prismaService.client.count.mockResolvedValue(1);

      await clientsService.findAll();

      expect(prismaService.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        }),
      );
    });

    it('should search by first name', async () => {
      prismaService.client.findMany.mockResolvedValue([mockClient]);
      prismaService.client.count.mockResolvedValue(1);

      await clientsService.findAll('Juan');

      expect(prismaService.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });

    it('should search by last name', async () => {
      prismaService.client.findMany.mockResolvedValue([mockClient]);
      prismaService.client.count.mockResolvedValue(1);

      await clientsService.findAll('Pérez');

      expect(prismaService.client.findMany).toHaveBeenCalled();
    });

    it('should search by phone', async () => {
      prismaService.client.findMany.mockResolvedValue([mockClient]);
      prismaService.client.count.mockResolvedValue(1);

      await clientsService.findAll('555');

      expect(prismaService.client.findMany).toHaveBeenCalled();
    });

    it('should search by email', async () => {
      prismaService.client.findMany.mockResolvedValue([mockClient]);
      prismaService.client.count.mockResolvedValue(1);

      await clientsService.findAll('juan@');

      expect(prismaService.client.findMany).toHaveBeenCalled();
    });

    it('should include active pets with basic info', async () => {
      const clientWithPets = {
        ...mockClient,
        pets: [{ id: 'pet-1', name: 'Max', species: 'Dog' }],
      };
      prismaService.client.findMany.mockResolvedValue([clientWithPets]);
      prismaService.client.count.mockResolvedValue(1);

      await clientsService.findAll();

      expect(prismaService.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            pets: expect.objectContaining({
              where: { isActive: true },
              select: expect.objectContaining({
                id: true,
                name: true,
                species: true,
                breed: true,
                weight: true,
              }),
            }),
          },
        }),
      );
    });

    it('should handle pagination parameters', async () => {
      prismaService.client.findMany.mockResolvedValue([]);
      prismaService.client.count.mockResolvedValue(0);

      await clientsService.findAll(undefined, { page: 2, limit: 10 });

      expect(prismaService.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a client with pets', async () => {
      const clientWithDetails = {
        ...mockClient,
        pets: [
          {
            id: 'pet-1',
            name: 'Max',
            species: 'Dog',
            vaccinations: [],
            weightHistory: [],
          },
        ],
      };
      prismaService.client.findUnique.mockResolvedValue(clientWithDetails);

      const result = await clientsService.findOne('client-123');

      expect(result.id).toBe('client-123');
      expect(result.pets).toHaveLength(1);
    });

    it('should throw NotFoundException when client not found', async () => {
      prismaService.client.findUnique.mockResolvedValue(null);

      await expect(
        clientsService.findOne('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should filter active pets only', async () => {
      prismaService.client.findUnique.mockResolvedValue(mockClient);

      await clientsService.findOne('client-123');

      expect(prismaService.client.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            pets: {
              where: { isActive: true },
              include: expect.any(Object),
            },
          },
        }),
      );
    });
  });

  describe('create', () => {
    const createClientDto = {
      firstName: 'María',
      lastName: 'García',
      phone: '5559876543',
      email: 'maria@example.com',
    };

    it('should create a new client', async () => {
      const newClient = { ...createClientDto, id: 'new-client-id' };
      prismaService.client.create.mockResolvedValue(newClient);

      const result = await clientsService.create(createClientDto);

      expect(result.id).toBe('new-client-id');
      expect(prismaService.client.create).toHaveBeenCalledWith({
        data: createClientDto,
      });
    });
  });

  describe('update', () => {
    it('should update a client successfully', async () => {
      prismaService.client.findUnique.mockResolvedValue(mockClient);
      prismaService.client.update.mockResolvedValue({
        ...mockClient,
        firstName: 'Updated',
      });

      const result = await clientsService.update('client-123', {
        firstName: 'Updated',
      });

      expect(result.firstName).toBe('Updated');
    });

    it('should throw NotFoundException for non-existent client', async () => {
      prismaService.client.findUnique.mockResolvedValue(null);

      await expect(
        clientsService.update('non-existent', { firstName: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should soft delete a client', async () => {
      prismaService.client.findUnique.mockResolvedValue(mockClient);
      prismaService.client.update.mockResolvedValue({
        ...mockClient,
        isActive: false,
      });

      await clientsService.delete('client-123');

      expect(prismaService.client.update).toHaveBeenCalledWith({
        where: { id: 'client-123' },
        data: { isActive: false },
      });
    });

    it('should throw NotFoundException for non-existent client', async () => {
      prismaService.client.findUnique.mockResolvedValue(null);

      await expect(
        clientsService.delete('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
