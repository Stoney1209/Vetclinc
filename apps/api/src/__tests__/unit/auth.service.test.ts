import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../modules/auth/auth.service';
import { PrismaService } from '../../database/prisma.service';
import { UserCommonService } from '../../modules/common/services/user-common.service';
import { createMockUser } from '../mocks/prisma.mock';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: any;
  let jwtService: any;
  let configService: any;
  let userCommonService: any;

  const mockUser = createMockUser({
    id: 'user-123',
    email: 'test@vetclinic.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'ADMIN',
    password: '$2b$10$hashedpassword',
  });

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      blacklistedToken: {
        findUnique: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    };

    userCommonService = {
      validateUniqueEmail: jest.fn(),
      hashPassword: jest.fn(),
      validatePassword: jest.fn(),
      findUserByEmail: jest.fn(),
      findUserById: jest.fn(),
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
        AuthService,
        { provide: PrismaService, useValue: prismaService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: UserCommonService, useValue: userCommonService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@vetclinic.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'ADMIN' as const,
    };

    it('should register a new user successfully', async () => {
      userCommonService.validateUniqueEmail.mockResolvedValue(undefined);
      userCommonService.hashPassword.mockResolvedValue('$2b$10$hashedpassword');
      prismaService.user.create.mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: mockUser.role,
      });

      const result = await authService.register(registerDto);

      expect(userCommonService.validateUniqueEmail).toHaveBeenCalledWith(registerDto.email);
      expect(userCommonService.hashPassword).toHaveBeenCalledWith(registerDto.password);
      expect(prismaService.user.create).toHaveBeenCalled();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(registerDto.email);
    });

    it('should throw ConflictException when email already exists', async () => {
      userCommonService.validateUniqueEmail.mockRejectedValue(
        new ConflictException('El email ya estÃ¡ registrado'),
      );

      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should hash password correctly', async () => {
      userCommonService.validateUniqueEmail.mockResolvedValue(undefined);
      userCommonService.hashPassword.mockResolvedValue('$2b$10$hashedpassword');
      prismaService.user.create.mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: mockUser.role,
      });

      await authService.register(registerDto);

      expect(userCommonService.hashPassword).toHaveBeenCalledWith(registerDto.password);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@vetclinic.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      userCommonService.findUserByEmail.mockResolvedValue(mockUser);
      userCommonService.validatePassword.mockResolvedValue(true);

      const result = await authService.login(loginDto);

      expect(userCommonService.findUserByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(userCommonService.validatePassword).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.id).toBe(mockUser.id);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      userCommonService.findUserByEmail.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      userCommonService.findUserByEmail.mockResolvedValue(mockUser);
      userCommonService.validatePassword.mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      userCommonService.findUserByEmail.mockResolvedValue(inactiveUser);
      userCommonService.validatePassword.mockResolvedValue(true);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should generate valid JWT token', async () => {
      userCommonService.findUserByEmail.mockResolvedValue(mockUser);
      userCommonService.validatePassword.mockResolvedValue(true);

      await authService.login(loginDto);

      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        },
        { expiresIn: '15m' },
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      userCommonService.findUserById.mockResolvedValue(mockUser);

      const result = await authService.getProfile(mockUser.id);

      expect(userCommonService.findUserById).toHaveBeenCalledWith(mockUser.id);
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      userCommonService.findUserById.mockRejectedValue(new UnauthorizedException());

      await expect(
        authService.getProfile('non-existent-id'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
