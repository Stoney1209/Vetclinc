import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UsersService } from '../../modules/users/users.service';
import { PrismaService } from '../../database/prisma.service';
import { UserCommonService } from '../../modules/common/services/user-common.service';
import { createMockUser } from '../mocks/prisma.mock';

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaService: any;
  let userCommonService: any;

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

    userCommonService = {
      validateUniqueEmail: jest.fn(),
      hashPassword: jest.fn(),
      findUserById: jest.fn(),
      getUserSelectFields: jest.fn().mockReturnValue({
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        specialty: true,
        licenseNumber: true,
        isActive: true,
        createdAt: true,
      }),
      getPublicUserSelectFields: jest.fn().mockReturnValue({
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaService },
        { provide: UserCommonService, useValue: userCommonService },
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
      userCommonService.findUserById.mockResolvedValue(mockUser);

      const result = await usersService.findOne('user-123');

      expect(userCommonService.findUserById).toHaveBeenCalledWith('user-123');
      expect(result.id).toBe('user-123');
    });

    it('should throw NotFoundException when user not found', async () => {
      userCommonService.findUserById.mockRejectedValue(
        new NotFoundException('Usuario no encontrado'),
      );

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
      userCommonService.validateUniqueEmail.mockResolvedValue(undefined);
      userCommonService.hashPassword.mockResolvedValue('hashedpassword');
      prismaService.user.create.mockResolvedValue({ id: 'new-id', ...createUserDto, password: 'hashed' });

      await usersService.create(createUserDto);

      expect(userCommonService.hashPassword).toHaveBeenCalledWith(createUserDto.password);
    });

    it('should throw ConflictException when email exists', async () => {
      userCommonService.validateUniqueEmail.mockRejectedValue(
        new ConflictException('El email ya estÃ¡ registrado'),
      );

      await expect(
        usersService.create(createUserDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      userCommonService.findUserById.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue({
        ...mockUser,
        firstName: 'Updated',
      });

      const result = await usersService.update('user-123', { firstName: 'Updated' });

      expect(result.firstName).toBe('Updated');
    });

    it('should throw NotFoundException for non-existent user', async () => {
      userCommonService.findUserById.mockRejectedValue(
        new NotFoundException('Usuario no encontrado'),
      );

      await expect(
        usersService.update('non-existent', { firstName: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should soft delete a user', async () => {
      userCommonService.findUserById.mockResolvedValue(mockUser);
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
      userCommonService.findUserById.mockRejectedValue(
        new NotFoundException('Usuario no encontrado'),
      );

      await expect(
        usersService.delete('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
