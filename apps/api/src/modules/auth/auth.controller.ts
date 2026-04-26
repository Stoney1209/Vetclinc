import { Controller, Post, Body, Get, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@vetclinic/prisma-client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private setRefreshCookie(response: Response, refreshToken: string): void {
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });
  }

  private clearRefreshCookie(response: Response): void {
    const isProduction = process.env.NODE_ENV === 'production';
    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/api/auth',
    });
  }

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register new user (admin only)' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response?: Response) {
    const result = await this.authService.register(dto);
    if (response) {
      this.setRefreshCookie(response, result.refreshToken);
    }
    return result;
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'User login' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response?: Response) {
    const result = await this.authService.login(dto);
    if (response) {
      this.setRefreshCookie(response, result.refreshToken);
    }
    return result;
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(
    @Req() req: Request,
    @Body('refreshToken') refreshTokenFromBody?: string,
    @Res({ passthrough: true }) response?: Response,
  ) {
    const refreshToken = refreshTokenFromBody ?? req.cookies?.refreshToken;
    const tokens = await this.authService.refresh(refreshToken);
    if (response) {
      this.setRefreshCookie(response, tokens.refreshToken);
    }
    return tokens;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (invalidate token)' })
  logout(
    @CurrentUser('sub') userId: string,
    @Req() req: Request,
    @Body('refreshToken') refreshTokenFromBody?: string,
    @Res({ passthrough: true }) response?: Response,
  ) {
    const authorizationHeader = req.headers.authorization as string | undefined;
    const accessToken = authorizationHeader?.startsWith('Bearer ')
      ? authorizationHeader.slice(7)
      : undefined;
    const refreshToken = refreshTokenFromBody ?? req.cookies?.refreshToken;
    if (response) {
      this.clearRefreshCookie(response);
    }

    return this.authService.logout(userId, accessToken, refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser('sub') userId: string) {
    return this.authService.getProfile(userId);
  }
}
