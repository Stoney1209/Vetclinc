import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from './database/prisma.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  async getHealth() {
    let database: 'up' | 'down' = 'up';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'down';
    }

    return {
      status: database === 'up' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'VetClinic API',
      checks: {
        database,
      },
    };
  }
}
