import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { UserCommonService } from '../common/services/user-common.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private userCommonService: UserCommonService,
  ) {}

  async isTokenInvalidated(token: string): Promise<boolean> {
    const isBlacklisted = await this.prisma.blacklistedToken.findUnique({
      where: { token },
    });
    return !!isBlacklisted;
  }

  async register(dto: RegisterDto) {
    await this.userCommonService.validateUniqueEmail(dto.email);
    const hashedPassword = await this.userCommonService.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        specialty: dto.specialty,
        licenseNumber: dto.licenseNumber,
      },
      select: this.userCommonService.getPublicUserSelectFields(),
    });

    const { accessToken, refreshToken } = await this.generateTokenPair(user.id, user.email, user.role);

    return { user, accessToken, refreshToken };
  }

  async login(dto: LoginDto) {
    const user = await this.userCommonService.findUserByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await this.userCommonService.validatePassword(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario desactivado');
    }

    const { accessToken, refreshToken } = await this.generateTokenPair(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Token de refresco requerido');
    }

    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!stored) {
      throw new UnauthorizedException('Token de refresco inválido');
    }

    if (new Date() > stored.expiresAt) {
      await this.prisma.refreshToken.delete({ where: { token: refreshToken } });
      throw new UnauthorizedException('Token de refresco expirado');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: stored.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      await this.prisma.refreshToken.delete({ where: { token: refreshToken } });
      throw new UnauthorizedException('Usuario no autorizado');
    }

    await this.prisma.refreshToken.delete({ where: { token: refreshToken } });
    const tokens = await this.generateTokenPair(user.id, user.email, user.role);

    return tokens;
  }

  async getProfile(userId: string) {
    return this.userCommonService.findUserById(userId);
  }

  async logout(userId: string, accessToken?: string, refreshToken?: string) {
    if (accessToken) {
      await this.prisma.blacklistedToken.create({
        data: { token: accessToken },
      }).catch(() => undefined);
    }

    if (refreshToken) {
      await this.prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    return { message: 'Sesión cerrada exitosamente' };
  }

  private async generateTokenPair(userId: string, email: string, role: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, email, role },
      { expiresIn: '15m' },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      { expiresIn: '7d' },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }
}
