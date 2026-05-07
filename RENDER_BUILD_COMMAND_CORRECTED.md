# Build Command CORREGIDO para Render

## Problema anterior:
```
ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL  Command "prisma" not found
```

## Solución:
Usar `npx prisma` en lugar de `pnpm exec prisma`

## Build Command CORRECTO para Render:
```
npm install -g pnpm && pnpm install && npx prisma generate --schema=prisma/schema.prisma && pnpm build
```

## Por qué funciona:
1. `npm install -g pnpm` - Instala pnpm globalmente
2. `pnpm install` - Instala dependencias del proyecto (incluye @prisma/client)
3. `npx prisma generate` - Usa Prisma CLI directamente (disponible globalmente)
4. `pnpm build` - Construye la aplicación

## Explicación:
- `pnpm exec prisma` no funciona porque Prisma CLI no está en el contexto de pnpm
- `npx prisma` funciona porque usa el paquete prisma directamente
- Esto es más robusto para entornos de producción como Render
