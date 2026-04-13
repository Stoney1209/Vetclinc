# 🚀 Deployment - VetClinic Pro

## Servicios Gratuitos Recomendados

| Servicio | Uso | Link |
|----------|-----|------|
| **Vercel** | Frontend Next.js | vercel.com |
| **Render** | Backend NestJS | render.com |
| **Neon** | PostgreSQL (500MB gratis) | neon.tech |

---

## Pasos de Deploy

### 1. Neon (Base de Datos)

1. Crear cuenta en [neon.tech](https://neon.tech)
2. Crear nuevo proyecto →命名为 `vetclinic`
3. Copiar **Connection String** (formato: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`)

### 2. Render (Backend NestJS)

1. Crear cuenta en [render.com](https://render.com)
2. New → Web Service
3. Conectar repositorio de GitHub
4. Configurar:
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
   - **Environment**: Node
5. Agregar variables de entorno:
   ```
   DATABASE_URL=postgresql://...@neon.tech/db?sslmode=require
   JWT_SECRET=genera-una-clave-segura-de-64-caracteres
   JWT_EXPIRES_IN=7d
   PORT=4000
   NODE_ENV=production
   CORS_ORIGINS=https://tu-proyecto.vercel.app
   ```

### 3. Vercel (Frontend Next.js)

1. Importar proyecto en [vercel.com](https://vercel.com)
2. Framework: Next.js
3. Agregar variable de entorno:
   ```
   NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com/api
   ```
4. Deploy automático en cada push

---

## Archivos de Configuración

- `Dockerfile` - Imagen Docker para el API
- `docker-compose.yml` - Orquestación local (opcional)
- `railway.json` - Configuración para Railway

---

## Verificación Post-Deploy

1. Probar endpoint: `https://tu-backend.onrender.com/api`
2. Verificar Swagger: `https://tu-backend.onrender.com/docs`
3. Login con credenciales seeded:
   - Email: `admin@vetclinic.com`
   - Password: `password123`