# VetClinic Pro

Sistema de gestión integral para clínicas veterinarias (B2B SaaS). Gestión de clientes, mascotas, citas médicas, expedientes clínicos, inventario y punto de venta.

## Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| **Node.js** | >= 18.0.0 | Runtime |
| **TypeScript** | ^5.3.3 | Lenguaje principal |
| **NestJS** | ^10.3.0 | Backend framework |
| **Next.js** | 14.1.0 | Frontend framework (App Router) |
| **Prisma** | 5.22.0 | ORM |
| **PostgreSQL** | 16 | Base de datos (instalación directa) |
| **Socket.io** | ^4.8.3 | Tiempo real |
| **TanStack Query** | ^5.17.0 | Estado del servidor |
| **Tailwind CSS** | ^3.4.1 | Estilos |
| **shadcn/ui** | - | Componentes UI |
| **Recharts** | ^3.8 | Gráficas y dashboards |
| **Zod** | ^3.22 | Validación de formularios |
| **pnpm** | 9.0.0 | Gestor de paquetes |

## Arquitectura

```mermaid
graph TB
    subgraph "Frontend (Next.js - Port 3000)"
        Web[Next.js 14 App Router]
        UI[shadcn/ui Components]
        RQ[TanStack Query]
        SIO[Socket.io Client]
        ZOD[Zod + react-hook-form]
    end

    subgraph "Backend (NestJS - Port 4000)"
        API[NestJS API]
        AUTH[Auth Module<br/>JWT + bcrypt]
        GUARDS[Guards<br/>JwtAuth + Roles + Throttler]
        SWAGGER[Swagger /docs]
        WSG[WebSocket Gateway<br/>/notifications]
        EFILTER[AllExceptionsFilter<br/>Prisma error mapping]
    end

    subgraph "Módulos"
        MOD1[Auth]
        MOD2[Users]
        MOD3[Clients]
        MOD4[Pets]
        MOD5[Appointments]
        MOD6[Medical Records]
        MOD7[Inventory]
        MOD8[Sales]
        MOD9[Uploads]
        MOD10[Notifications]
        MOD11[Prescriptions]
        MOD12[Reports]
    end

    subgraph "Persistencia"
        PG[(PostgreSQL 16)]
    end

    Web -->|HTTP/REST| API
    SIO -->|WebSocket| WSG
    API --> AUTH
    API --> GUARDS
    GUARDS --> MOD1
    GUARDS --> MOD2
    GUARDS --> MOD3
    GUARDS --> MOD4
    GUARDS --> MOD5
    GUARDS --> MOD6
    GUARDS --> MOD7
    GUARDS --> MOD8
    GUARDS --> MOD9
    GUARDS --> MOD10
    GUARDS --> MOD11
    GUARDS --> MOD12
    API -->|Prisma ORM| PG
    API --> EFILTER
```

## Inicio Rápido

### Prerrequisitos

- Node.js >= 18
- pnpm 9.x (`npm install -g pnpm@9`)
- PostgreSQL 16 instalado y corriendo

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Configurar variables de entorno

Editar `apps/api/.env` con tu conexión PostgreSQL:

```env
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/vetclinic"
JWT_SECRET="tu-secreto-de-128-caracteres-hex"
JWT_EXPIRES_IN="7d"
PORT=4000
CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
NODE_ENV="development"
```

### 3. Crear la base de datos

```bash
# Conectar a PostgreSQL y crear la DB
createdb -U postgres vetclinic
# O desde psql: CREATE DATABASE vetclinic;
```

### 4. Ejecutar migraciones

```bash
pnpm db:migrate
```

### 5. Generar cliente Prisma

```bash
pnpm db:generate
```

### 6. Cargar datos de prueba

```bash
pnpm db:seed
```

### 7. Iniciar modo desarrollo

```bash
pnpm dev
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api
- **Swagger Docs**: http://localhost:4000/docs (solo desarrollo)
- **Prisma Studio**: `pnpm db:studio` (http://localhost:5555)

## Scripts Disponibles

### Raíz del proyecto (`vetclinic/`)

| Script | Descripción |
|---|---|
| `pnpm dev` | Ejecuta frontend y backend en paralelo |
| `pnpm build` | Compila todas las aplicaciones |
| `pnpm lint` | Ejecuta ESLint en todas las aplicaciones |
| `pnpm db:migrate` | Ejecuta migraciones de Prisma |
| `pnpm db:generate` | Genera el cliente Prisma |
| `pnpm db:push` | Aplica el schema a la BD sin migración |
| `pnpm db:studio` | Abre Prisma Studio |
| `pnpm db:seed` | Carga datos de prueba |

### Backend (`apps/api/`)

| Script | Descripción |
|---|---|
| `pnpm dev` | Inicia NestJS en modo watch (port 4000) |
| `pnpm build` | Compila el proyecto |
| `pnpm start` | Inicio en producción |
| `pnpm lint` | ESLint |

### Frontend (`apps/web/`)

| Script | Descripción |
|---|---|
| `pnpm dev` | Inicia Next.js (port 3000) |
| `pnpm build` | Compila para producción |
| `pnpm start` | Inicio en producción |
| `pnpm lint` | Next.js linter |

## Variables de Entorno

### Backend (`apps/api/.env`)

```env
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/vetclinic"
JWT_SECRET="<128-char-hex-secret>"
JWT_EXPIRES_IN="7d"
PORT=4000
CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
NODE_ENV="development"
```

| Variable | Descripción | Default |
|---|---|---|
| `DATABASE_URL` | URL de conexión PostgreSQL | Requerido |
| `JWT_SECRET` | Secreto para firmar JWT (mínimo 128 caracteres hex) | Requerido |
| `JWT_EXPIRES_IN` | Tiempo de expiración del token | `7d` |
| `PORT` | Puerto del servidor API | `4000` |
| `CORS_ORIGINS` | Orígenes permitidos (comma-separated) | `http://localhost:3000,http://127.0.0.1:3000` |
| `NODE_ENV` | Entorno de ejecución | `development` |

### Frontend (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Credenciales de Desarrollo

> **Nota**: Las credenciales solo están disponibles en modo `development`.

| Rol | Email | Contraseña |
|---|---|---|
| **Admin** | `admin@vetclinic.com` | `password123` |
| **Veterinario** | `dr.smith@vetclinic.com` | `password123` |
| **Veterinaria** | `dra.lopez@vetclinic.com` | `password123` |
| **Recepcionista** | `reception@vetclinic.com` | `password123` |

## Roles del Sistema

| Rol | Descripción |
|---|---|
| `ADMIN` | Acceso total al sistema |
| `VETERINARIAN` | Expedientes, citas, mascotas, prescripciones |
| `RECEPTIONIST` | Clientes, citas, ventas |
| `INVENTORY_MANAGER` | Inventario, productos, stock |

## Estructura del Proyecto

```
vetclinic/
├── apps/
│   ├── api/                    # NestJS backend (port 4000)
│   │   └── src/
│   │       ├── modules/        # Módulos de funcionalidad
│   │       │   ├── auth/       # Autenticación JWT
│   │       │   ├── clients/
│   │       │   ├── pets/
│   │       │   ├── sales/
│   │       │   ├── appointments/
│   │       │   ├── medical-records/
│   │       │   ├── inventory/
│   │       │   ├── prescriptions/  # Prescripciones digitales
│   │       │   ├── reports/        # Reportes y KPIs
│   │       │   ├── notifications/
│   │       │   ├── uploads/
│   │       │   └── common/     # Guards, decoradores, filtros, DTOs
│   │       ├── database/       # Servicio Prisma
│   │       └── main.ts         # Punto de entrada
│   └── web/                    # Next.js frontend (port 3000)
│       ├── src/
│       │   ├── app/            # App Router (Next.js 14)
│       │   ├── components/     # Componentes UI (shadcn/ui)
│       │   ├── hooks/          # Custom hooks (TanStack Query)
│       │   ├── lib/            # API client, utilidades
│       │   └── types/          # TypeScript types centralizados
├── prisma/
│   ├── schema.prisma           # Schema de base de datos
│   └── seed.ts                 # Datos de prueba
├── docs/
│   └── API.md                  # Referencia completa del API
└── package.json                # Configuración del monorepo
```

## Seguridad Implementada

### Autenticación y Autorización
- JWT authentication con secreto de 128 caracteres hex
- `JwtAuthGuard` global para endpoints protegidos
- `RolesGuard` con decorador `@Roles()` para control granular
- Registro de usuarios (`POST /auth/register`) restringido a `ADMIN` únicamente

### Rate Limiting y Headers
- Rate limiting global (`ThrottlerGuard`): 10 req/s, 50 req/10s, 100 req/min
- Helmet security headers (CSP, HSTS, X-Frame-Options, etc.)

### Validación y Filtros
- Validación de entrada con `class-validator` + `whitelist` + `forbidNonWhitelisted`
- Filtro global de errores Prisma (`AllExceptionsFilter`) que mapea códigos P2002, P2025, P2003, P2014, P2021, P2022 a HTTP status codes

### Protección de Uploads
- Protección contra path traversal en uploads
- Validación de extensión y MIME type

### WebSocket
- Verificación JWT en conexiones WebSocket
- CORS configurable para WebSocket via `CORS_ORIGINS` env var

### Transacciones
- Transacciones Prisma para operaciones críticas: creación y cancelación de ventas, registro de peso

### Entorno
- Swagger disponible solo en entornos no productivos (`NODE_ENV !== 'production'`)
- CORS configurable via variable de entorno `CORS_ORIGINS`
