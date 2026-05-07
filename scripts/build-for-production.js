#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Preparando build para producción (Prisma 7+)...');

// 1. Actualizar schema.prisma para producción
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

schema = schema.replace(
  /datasource db \{\s*provider = "postgresql"\s*url\s*=\s*env\("DATABASE_URL"\)\s*\}/,
  'datasource db {\n  provider = "postgresql"\n}'
);

fs.writeFileSync(schemaPath, schema);
console.log('✅ Schema.prisma actualizado para Prisma 7+');

// 2. Actualizar PrismaService para producción
const prismaServicePath = path.join(__dirname, '../apps/api/src/database/prisma.service.ts');
let prismaService = fs.readFileSync(prismaServicePath, 'utf8');

prismaService = prismaService.replace(
  `import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@vetclinic/prisma-client';`,
  `import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@vetclinic/prisma-client';
import { ConfigService } from '@nestjs/config';`
);

prismaService = prismaService.replace(
  `@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {`,
  `@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
    });
  }`
);

fs.writeFileSync(prismaServicePath, prismaService);
console.log('✅ PrismaService actualizado para producción');

// 3. Generar Prisma client
console.log('🔧 Generando Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generado');
} catch (error) {
  console.error('❌ Error generando Prisma client:', error.message);
  process.exit(1);
}

console.log('🎉 Build para producción listo');
