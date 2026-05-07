# Build Command para Render

## Comando Correcto:
```
npm install -g pnpm && pnpm install && pnpm build:render
```

## Explicación:
1. `npm install -g pnpm` - Instala pnpm globalmente
2. `pnpm install` - Instala dependencias del proyecto
3. `pnpm build:render` - Ejecuta nuestro script optimizado

## build:render ejecuta:
```
pnpm install && pnpm exec prisma generate --schema=prisma/schema.prisma && pnpm build
```

## Por qué funciona:
- Instala dependencias ANTES de generar Prisma
- Usa nuestra configuración sin URL en schema
- PrismaService obtiene DATABASE_URL del ConfigService
