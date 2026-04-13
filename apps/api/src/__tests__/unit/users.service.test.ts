import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UsersService } from '../../modules/users/users.service';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { createMockUser } from '../mocks/prisma.mock';

jest.mock('bcrypt');

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaService: any;

  const mockUser = createMockUser({
    id: 'user-123',
    email: 'test@vetclinic.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'ADMIN',
  });

  beforeEach(async () => {
    prismaService = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      prismaService.user.findMany.mockResolvedValue([mockUser]);
      prismaService.user.count.mockResolvedValue(1);

      const result = await usersService.findAll();

      expect(result).toHaveProperty('data');
      expect(result.total).toBe(1);
    });

    it('should filter only active users', async () => {
      prismaService.user.findMany.mockResolvedValue([mockUser]);
      prismaService.user.count.mockResolvedValue(1);

      await usersService.findAll();

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
        }),
      );
    });

    it('should handle pagination', async () => {
      prismaService.user.findMany.mockResolvedValue([]);
      prismaService.user.count.mockResolvedValue(0);

      await usersService.findAll({ page: 2, limit: 10 });

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe('findVeterinarians', () => {
    it('should return only veterinarian users', async () => {
      const vets = [
        { ...mockUser, role: 'VETERINARIAN' },
      ];
      prismaService.user.findMany.mockResolvedValue(vets);

      await usersService.findVeterinarians();

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            role: 'VETERINARIAN',
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await usersService.findOne('user-123');

      expect(result.id).toBe('user-123');
    });

    it('should throw NotFoundException when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        usersService.findOne('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createUserDto = {
      email: 'new@vetclinic.com',
      password: 'Password123!',
      firstName: 'New',
      lastName: 'User',
      role: 'VETERINARIAN' as const,
    };

    it('should hash password before creating user', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue({ id: 'new-id', ...createUserDto, password: 'hashed' });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

      await usersService.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    });

    it('should throw ConflictException when email exists', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        usersService.create(createUserDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue({
        ...mockUser,
        firstName: 'Updated',
      });

      const result = await usersService.update('user-123', { firstName: 'Updated' });

      expect(result.firstName).toBe('Updated');
    });

    it('should throw NotFoundException for non-existent user', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        usersService.update('non-existent', { firstName: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should soft delete a user', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await usersService.delete('user-123');

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { isActive: false },
      });
    });

    it('should throw NotFoundException for non-existent user', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        usersService.delete('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
