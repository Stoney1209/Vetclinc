#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Detectar si estamos en producción (Render)
const isProduction = process.env.RENDER || process.env.NODE_ENV === 'production';

if (isProduction) {
  console.log('🔧 Configurando Prisma para producción (Prisma 7+)...');
  
  // Leer schema.prisma actual
  const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
  let schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Remover url del datasource para Prisma 7+
  schema = schema.replace(
    /datasource db \{\s*provider = "postgresql"\s*url\s*=\s*env\("DATABASE_URL"\)\s*\}/,
    'datasource db {\n  provider = "postgresql"\n}'
  );
  
  // Escribir schema modificado
  fs.writeFileSync(schemaPath, schema);
  console.log('✅ Schema.prisma actualizado para producción');
  
} else {
  console.log('🔧 Manteniendo configuración local (Prisma 5.22.0)');
}
