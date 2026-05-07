# Build Command FINAL con Path Absoluto para Render

## Problema anterior:
```
Error: Could not load --schema from provided path prisma/schema.prisma: file or directory not found
```

## Solución:
Usar path absoluto desde el directorio raíz del proyecto

## Build Command FINAL para Render:
```
npm install -g pnpm && pnpm install && npx prisma generate && pnpm build
```

## Por qué funciona:
1. `npm install -g pnpm` - Instala pnpm globalmente
2. `pnpm install` - Instala dependencias del proyecto
3. `npx prisma generate` - Usa path por defecto (busca schema.prisma en locations estándar)
4. `pnpm build` - Construye la aplicación

## Explicación:
- Sin --schema permite que Prisma encuentre automáticamente el schema.prisma
- Prisma busca en locations estándar: ./prisma/schema.prisma, ./schema.prisma, etc.
- Esto es más robusto para entornos de producción donde los paths relativos pueden fallar

## Estructura esperada:
```
/opt/render/project/src/
├── prisma/
│   └── schema.prisma
├── apps/
│   ├── api/
│   └── web/
└── package.json
```
