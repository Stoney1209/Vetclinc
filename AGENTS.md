# VetClinic Pro - Agent Guidelines

## Project Overview

Veterinary clinic management SaaS application (B2B) built with:
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query
- **Backend**: NestJS, TypeScript, Prisma ORM
- **Database**: PostgreSQL with Prisma
- **Real-time**: Socket.io

---

## Context7 MCP Auto-Rule (New)

A partir de ahora, cuando se solicite documentación de bibliotecas, APIs, o requerimientos que involucren herramientas de desarrollo (setup, configuración, generación de código, ejemplos, referencias API), se debe usar Context7 MCP automáticamente sin necesidad de pedirlo. Esto implica:

- Resolver la Library ID y consultar la documentación actual mediante Context7 (resolver-library-id y query-docs) y luego incorporar la información citando versión.
- Usar las snippets y ejemplos de la documentación para generar código o pasos de configuración exactos.
- Citación de versión cuando esté disponible.
- Si existen múltiples fuentes, priorizar las oficiales/autoritativas.
- En tareas simples donde no aplica, proceder con la solución directa, pero cuando haya IO de documentación, preferir Context7.


## Repository Structure

```
vetclinic/
├── apps/
│   ├── api/                    # NestJS backend (port 4000)
│   │   └── src/
│   │       ├── modules/       # Feature modules (auth, users, clients, etc.)
│   │       ├── database/      # Prisma service
│   │       ├── common/        # Guards, decorators, filters
│   │       └── main.ts
│   └── web/                   # Next.js frontend (port 3000)
│       └── src/
│           ├── app/           # App Router pages
│           ├── components/    # UI components (shadcn/ui)
│           ├── hooks/         # TanStack Query hooks
│           └── lib/           # API client, utilities
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts               # Seed data
└── package.json               # Monorepo configuration
```

---

## Build & Development Commands

### Root Commands (from `vetclinic/`)

```bash
# Install all dependencies
pnpm install

# Development (runs both apps in parallel)
pnpm dev

# Build all apps
pnpm build

# Lint all apps
pnpm lint

# Database operations
pnpm db:migrate       # Run migrations
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to DB
pnpm db:studio        # Open Prisma Studio
pnpm db:seed          # Seed database
```

### Backend Commands (from `apps/api/`)

```bash
# Development
pnpm dev              # Start with watch mode
pnpm build           # Production build
pnpm start           # Production start
pnpm lint            # ESLint

# Prisma (run from apps/api/)
npx prisma migrate dev --name <migration_name>
npx prisma generate
npx prisma db push
npx prisma studio
ts-node prisma/seed.ts
```

### Frontend Commands (from `apps/web/`)

```bash
# Development
pnpm dev              # Start dev server (port 3000)
pnpm build            # Production build
pnpm start            # Production start
pnpm lint             # ESLint/Next.js lint
```

### Database Operations

```bash
# Ensure PostgreSQL is running (Windows service or direct installation)
# Then apply schema changes:
npx prisma db push          # Push schema changes to DB
npx prisma generate         # Regenerate Prisma client
npx prisma migrate dev      # Create and apply migration
npx prisma studio           # Open Prisma Studio GUI
```

---

## Code Style Guidelines

### TypeScript Conventions

#### Types & Interfaces
- Use `interface` for object shapes that may be extended
- Use `type` for unions, intersections, and aliases
- Always define return types for functions
- Use strict null checks (`strictNullChecks: true`)

```typescript
// Good
interface User {
  id: string;
  email: string;
  role: Role;
}

type CreateUserDto = Partial<User>;

// Bad
const user = { id: "123", email: "test@test.com" };
```

#### Null & Undefined
- Prefer `undefined` over `null` for optional values
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Avoid non-null assertions (`!`) unless absolutely certain

```typescript
// Good
const name = user?.name ?? 'Anonymous';

// Bad
const name = user.name;
```

### Backend (NestJS) Conventions

#### Module Structure
Each feature module follows this pattern:
```
module/
├── dto/
│   └── *.dto.ts
├── *.controller.ts
├── *.service.ts
├── *.module.ts
└── *.entity.ts (if not using Prisma)
```

#### Naming Conventions
- **Controllers**: `*.controller.ts` (PascalCase)
- **Services**: `*.service.ts` (PascalCase)
- **DTOs**: `*.dto.ts` (PascalCase)
- **Modules**: `*.module.ts` (PascalCase)
- **Decorators**: `@` prefix for custom decorators

#### Service Pattern
```typescript
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<User[]> { }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
```

#### Error Handling
- Use NestJS built-in exceptions
- Throw `NotFoundException` for missing resources
- Throw `BadRequestException` for invalid input
- Throw `ConflictException` for duplicate resources
- Throw `ForbiddenException` for authorization failures

#### Validation
- Use `class-validator` decorators in DTOs
- Use `ValidationPipe` globally in `main.ts`
- Always validate request bodies with DTOs

### Frontend (Next.js) Conventions

#### Component Structure
```typescript
// Good - Functional component with explicit types
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'default', size = 'md', children, onClick }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }))} onClick={onClick}>
      {children}
    </button>
  );
}
```

#### Hooks Pattern (TanStack Query)
```typescript
// Good - Custom hook with proper typing
export function useClients(search?: string) {
  return useQuery({
    queryKey: ['clients', search],
    queryFn: () => clientsApi.getAll(search).then((res) => res.data),
  });
}

// Good - Mutation with invalidation
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientDto) => clientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Cliente creado');
    },
  });
}
```

#### API Client Pattern
```typescript
// Good - Typed API functions
export const clientsApi = {
  getAll: (search?: string) =>
    api.get('/clients', { params: { search } }),
  create: (data: CreateClientDto) => api.post('/clients', data),
};

// Usage with proper typing
const { data } = useQuery({
  queryKey: ['clients', search],
  queryFn: () => clientsApi.getAll(search).then((res) => res.data),
});
```

### Import Conventions

#### Order (enforced by ESLint)
1. React/Next.js imports
2. Third-party libraries
3. Internal modules ( `@/` for web, relative for api)
4. Type imports (`import type`)

```typescript
// web (Next.js)
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { useClients } from '@/hooks/use-clients';
import type { Client } from '@/types';

// api (NestJS)
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/users.dto';
import type { User } from '@prisma/client';
```

#### Path Aliases
- **Frontend**: `@/*` maps to `apps/web/src/*`
- **Backend**: `@/*` maps to `apps/api/src/*`

### Database (Prisma) Conventions

#### Schema Naming
- Use PascalCase for model names
- Use camelCase for field names
- Use `@@map()` to define actual table names
- Use snake_case in `@map()` for columns that need it

```prisma
model MedicalRecord {
  id             String   @id @default(uuid())
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@map("medical_records")
}
```

#### Enums
- Use PostgreSQL enums for fixed sets of values
- Name enums with PascalCase, values with UPPER_SNAKE_CASE

```prisma
enum Role {
  ADMIN
  VETERINARIAN
  RECEPTIONIST
  INVENTORY_MANAGER
}
```

---

## API Design Guidelines

### RESTful Conventions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/resource` | List all |
| GET | `/resource/:id` | Get one |
| POST | `/resource` | Create |
| PATCH | `/resource/:id` | Update (partial) |
| PUT | `/resource/:id` | Update (full) |
| DELETE | `/resource/:id` | Delete/Deactivate |

### Response Format
```typescript
// Success - return data directly
return this.prisma.user.findMany();

// Error - throw appropriate exception
throw new NotFoundException('User not found');
```

### Authentication
- Use JWT Bearer tokens
- All protected routes require `@UseGuards(JwtAuthGuard)`
- Role-based access uses `@Roles(Role.ADMIN)` decorator

---

## Environment Variables

### Backend (apps/api/.env)
```env
DATABASE_URL="postgresql://postgres:vetclinic123@localhost:5432/vetclinic"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=4000
```

### Frontend (apps/web/.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## Testing Guidelines

Tests are not yet implemented. When adding tests:
- Backend: Use Jest with `@nestjs/testing`
- Frontend: Use Vitest or Jest with React Testing Library
- Place test files alongside source files: `*.spec.ts` or `*.test.ts`

---

## Common Patterns

### Soft Delete
Use `isActive` boolean field, filter in queries:
```typescript
where: { isActive: true }
```

### Real-time Updates
Socket.io events are defined in `NotificationGateway`:
- `appointment:created`, `appointment:updated`
- `stock:low`
- `sale:created`

### Validation Messages
Use Spanish for user-facing messages:
```typescript
throw new NotFoundException('Mascota no encontrada');
```

---

## Getting Started for Development

1. Copy `.env` files and configure database connection
2. Ensure PostgreSQL is running (Windows service or local installation)
3. Run `pnpm install` to install dependencies
4. Run `npx prisma db push` to apply schema to database
5. Run `npx prisma db seed` to seed test data
6. Run `pnpm dev` to start both apps
7. Access frontend at http://localhost:3000
8. Login: `admin@vetclinic.com` / `password123`

--- Context7 MCP Auto-Rule (Global)

- Description: Always use Context7 MCP automatically for any request involving library/API documentation, code generation, or setup/configuration steps. No explicit user request needed.
- Activation: Global; applies to all agent tasks touching docs/code/setup unless user explicitly opts out.
- Workflow:
  1) Resolve library ID via resolver (`resolve-library-id`) using library name and user query.
  2) Pick best match (prefer exact name and version if provided).
  3) Fetch docs with `query-docs` and the selected library ID.
  4) Answer with current docs, including version citation and code examples.
  5) If no docs exist, provide a best-practices answer with a clear fallback and note the missing docs.
- Output: Include a citation of the library version when available and code examples from the docs where relevant.
- Notes: Applies to all agent tasks that touch docs/code/setup unless user explicitly opts out.

--- Context7 MCP Auto-Rule (Global)

- Description: Always use Context7 MCP automatically for any request involving library/API documentation, code generation, or setup/configuration steps. No explicit user request needed.
- Activation: Applies to all agent tasks that touch docs/code/setup unless user explicitly opts out.
- Workflow:
  1) Resolve library ID via resolver (`resolve-library-id`) using library name and user query.
  2) Pick best match (prefer exact name and version if provided).
  3) Fetch docs with `query-docs` and the selected library ID.
  4) Answer with current docs, including version citation and code examples.
- Sources: Prefer official docs; cite version in outputs.
- Exceptions: If user requests not to use Context7, or no docs exist, fall back to best-available guidance.
- Verification: Provide a quick test prompt like “How to configure Next.js” and ensure doc excerpt + code appears.
