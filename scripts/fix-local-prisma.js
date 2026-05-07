#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Script para desarrollo local - agrega URL al schema
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Agregar URL para desarrollo local
if (!schema.includes('url      = env("DATABASE_URL")')) {
  schema = schema.replace(
    /datasource db \{\s*provider = "postgresql"\s*\}/,
    'datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}'
  );
  fs.writeFileSync(schemaPath, schema);
  console.log('✅ Schema.prisma configurado para desarrollo local');
}
