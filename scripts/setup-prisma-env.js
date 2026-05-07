#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Detectar ambiente
const isProduction = process.env.RENDER || process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
const prismaServicePath = path.join(__dirname, '../apps/api/src/database/prisma.service.ts');

console.log(`🔧 Configurando Prisma para: ${isProduction ? 'PRODUCCIÓN (Prisma 7+)' : 'DESARROLLO (Prisma 5.22.0)'}`);

if (isProduction) {
  // Configuración para Prisma 7+ (Producción)
  console.log('📦 Aplicando configuración para Prisma 7+...');
  
  // Schema sin URL
  let schema = fs.readFileSync(schemaPath, 'utf8');
  schema = schema.replace(
    /datasource db \{\s*provider = "postgresql"\s*url\s*=\s*env\("DATABASE_URL"\)\s*\}/g,
    'datasource db {\n  provider = "postgresql"\n}'
  );
  fs.writeFileSync(schemaPath, schema);
  
  // PrismaService con ConfigService
  let prismaService = `import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@vetclinic/prisma-client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}`;
  
  fs.writeFileSync(prismaServicePath, prismaService);
  
} else {
  // Configuración para Prisma 5.22.0 (Desarrollo)
  console.log('💻 Aplicando configuración para Prisma 5.22.0...');
  
  // Schema con URL
  let schema = fs.readFileSync(schemaPath, 'utf8');
  schema = schema.replace(
    /datasource db \{\s*provider = "postgresql"\s*\}/g,
    'datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}'
  );
  fs.writeFileSync(schemaPath, schema);
  
  // PrismaService simple
  let prismaService = `import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@vetclinic/prisma-client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}`;
  
  fs.writeFileSync(prismaServicePath, prismaService);
}

console.log('✅ Configuración aplicada exitosamente');
