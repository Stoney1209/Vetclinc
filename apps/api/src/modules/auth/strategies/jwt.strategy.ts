import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { PrismaService } from '../../../database/prisma.service';
import { Role } from '@vetclinic/prisma-client';

interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    configService: ConfigService,
  ) {
    super({
      passReqToCallback: true,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader?.startsWith('Bearer ')
      ? authorizationHeader.slice(7)
      : undefined;

    if (token) {
      const blacklistedToken = await this.prisma.blacklistedToken.findUnique({
        where: { token },
      });

      if (blacklistedToken) {
        throw new UnauthorizedException('Token invalidado');
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no autorizado');
    }

    return { sub: user.id, email: user.email, role: user.role };
  }
}
