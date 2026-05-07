# Build Command FINAL para Render

## Comando CORRECTO para Render:
```
npm install -g pnpm && pnpm install && pnpm exec prisma generate --schema=prisma/schema.prisma && pnpm build
```

## Por qué este comando funciona:
1. `npm install -g pnpm` - Instala pnpm globalmente
2. `pnpm install` - Instala dependencias del proyecto
3. `pnpm exec prisma generate --schema=prisma/schema.prisma` - Genera Prisma client
4. `pnpm build` - Ejecuta build principal (que ya incluye Prisma generate)

## Explicación del error anterior:
- `build:render` no existe como comando en el contexto de ejecución de Render
- Render ejecuta desde el directorio raíz pero no encuentra los scripts personalizados

## Solución:
Usar comandos directos en lugar de scripts personalizados para Render.
