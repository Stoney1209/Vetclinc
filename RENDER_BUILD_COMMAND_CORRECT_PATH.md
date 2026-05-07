# Build Command con Path Correcto para Render

## Problema anterior:
```
Error: Could not find Prisma Schema that is required for this command.
Checked following paths:
schema.prisma: file not found
prisma/schema.prisma: file not found
```

## Análisis:
Render ejecuta desde /opt/render/project/src/ pero no encuentra schema.prisma

## Build Command con Path Absoluto CORRECTO:
```
npm install -g pnpm && pnpm install && npx prisma generate --schema ./prisma/schema.prisma && pnpm build
```

## Alternativa si lo anterior falla:
```
npm install -g pnpm && pnpm install && cd /opt/render/project/src && npx prisma generate --schema ./prisma/schema.prisma && pnpm build
```

## Por qué debería funcionar:
1. `npm install -g pnpm` - Instala pnpm globalmente
2. `pnpm install` - Instala dependencias del proyecto
3. `npx prisma generate --schema ./prisma/schema.prisma` - Especifica path absoluto desde directorio actual
4. `pnpm build` - Construye la aplicación

## Estructura esperada en Render:
```
/opt/render/project/src/
├── prisma/
│   └── schema.prisma
├── apps/
│   ├── api/
│   └── web/
└── package.json
```

## Si falla, probar con:
- `--schema ../../prisma/schema.prisma` (si ejecuta desde apps/api)
- `--schema /opt/render/project/src/prisma/schema.prisma` (path completo)
