import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../modules/auth/auth.controller';
import { AuthService } from '../../modules/auth/auth.service';
import { JwtAuthGuard } from '../../modules/common/guards/jwt-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call authService.register with correct parameters', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'ADMIN' as const,
      };
      const expectedResult = {
        user: { id: '1', email: 'test@example.com' },
        token: 'jwt-token',
      };
      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should call authService.login with correct parameters', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = {
        user: { id: '1', email: 'test@example.com' },
        token: 'jwt-token',
      };
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getProfile', () => {
    it('should call authService.getProfile with user id from request', async () => {
      const expectedResult = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'ADMIN',
      };
      mockAuthService.getProfile.mockResolvedValue(expectedResult);

      const result = await controller.getProfile('user-123');

      expect(authService.getProfile).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(expectedResult);
    });
  });
});
