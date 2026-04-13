# VetClinic Pro — Frontend

Frontend de la aplicación construido con Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query y Zod para validación.

## Arquitectura del Frontend

```mermaid
graph TD
    subgraph "App Router Pages"
        LOGIN[/(auth)/login]
        ROOT[/(root)/]
        DASH[/(dashboard)/dashboard]
        APPTS[/(dashboard)/appointments]
        CLIENTS[/(dashboard)/clients]
        RECORDS[/(dashboard)/medical-records]
        INVENT[/(dashboard)/inventory]
        SALES[/(dashboard)/sales]
    end

    subgraph "Providers"
        AUTH_P[AuthProvider]
        QCP[QueryClientProvider]
        SOCKET[SocketProvider]
        TOAST[Toaster]
    end

    subgraph "Hooks (TanStack Query)"
        HOOKS[Custom Hooks]
        HOOKS --> API_CLIENT[API Client]
    end

    subgraph "Validation"
        ZOD[Zod Schemas]
        RHF[react-hook-form]
        ZOD --> RHF
    end

    subgraph "UI Layer"
        SHADCN[shadcn/ui Components]
        CUSTOM[Custom Components]
    end

    AUTH_P --> DASH
    QCP --> HOOKS
    SOCKET --> DASH
    API_CLIENT -->|axios| BACKEND[NestJS API :4000]
    RHF --> CLIENTS
    RHF --> APPTS
```

## Estructura de Directorios

```
apps/web/src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx          # Página de login
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Layout con sidebar + AuthProvider
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Dashboard principal
│   │   ├── appointments/
│   │   │   └── page.tsx          # Gestión de citas + calendario
│   │   ├── clients/
│   │   │   └── page.tsx          # CRM de clientes
│   │   ├── medical-records/
│   │   │   └── page.tsx          # Expedientes clínicos
│   │   ├── inventory/
│   │   │   └── page.tsx          # Inventario y productos
│   │   └── sales/
│   │       └── page.tsx          # Punto de venta
│   ├── (root)/
│   │   └── page.tsx              # Landing / redirect
│   ├── layout.tsx                # Root layout
│   └── providers.tsx             # Providers globales
├── components/
│   ├── calendar/
│   │   └── calendar-view.tsx     # Vista de calendario (react-big-calendar)
│   └── ui/                       # Componentes shadcn/ui + custom
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── breadcrumb.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── confirm-dialog.tsx    # Diálogo de confirmación (acciones destructivas)
│       ├── dialog.tsx
│       ├── empty-state.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── page-transition.tsx
│       ├── popover.tsx
│       ├── select.tsx
│       ├── skeleton.tsx
│       ├── table.tsx
│       ├── textarea.tsx
│       └── tooltip.tsx
├── hooks/                        # Custom hooks (TanStack Query)
│   ├── use-appointments.ts
│   ├── use-clients.ts
│   ├── use-debounce.ts           # Hook genérico de debounce
│   ├── use-inventory.ts
│   ├── use-medical-records.ts
│   ├── use-pets.ts               # useCreatePet, useDeletePet
│   ├── use-sales.ts
│   ├── use-veterinarians.ts      # Lista de veterinarios (staleTime: 5 min)
│   └── __tests__/                # Tests de hooks (Vitest)
│       └── use-debounce.test.ts
├── lib/
│   ├── api.ts                    # API client (axios) con interceptors
│   ├── appointment-types.ts      # Constantes de tipos de cita
│   ├── auth-context.tsx          # AuthProvider + useAuth() hook
│   ├── socket.tsx                # SocketProvider + useSocket() hook
│   ├── utils.ts                  # Utilidades (cn, etc.)
│   ├── validations/
│   │   ├── client.ts             # Zod schema para clientes
│   │   └── pet.ts                # Zod schema para mascotas
│   └── __tests__/
│       └── validations.test.ts   # Tests de validación (Vitest)
├── test/
│   └── setup.ts                  # Setup de Vitest (mocks globales)
└── types/
    └── index.ts                  # TypeScript types centralizados (18+ interfaces)
```

## App Router Structure

La aplicación usa route groups de Next.js 14:

| Route Group | Layout | Descripción |
|---|---|---|
| `(auth)` | Ninguno | Páginas de autenticación (login) |
| `(dashboard)` | `layout.tsx` | Páginas autenticadas con sidebar |
| `(root)` | Ninguno | Página raíz / landing |

### Navegación del Dashboard

Definida en `apps/web/src/app/(dashboard)/layout.tsx:24-31`:

```typescript
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Agenda', href: '/appointments', icon: Calendar },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Expedientes', href: '/medical-records', icon: FileText },
  { name: 'Inventario', href: '/inventory', icon: Package },
  { name: 'Ventas', href: '/sales', icon: ShoppingCart },
];
```

## Componentes UI (shadcn/ui)

Componentes instalados desde shadcn/ui:

| Componente | Archivo | Uso |
|---|---|---|
| `Avatar` | `components/ui/avatar.tsx` | Avatares de usuario |
| `Badge` | `components/ui/badge.tsx` | Estados y etiquetas |
| `Breadcrumb` | `components/ui/breadcrumb.tsx` | Navegación breadcrumb |
| `Button` | `components/ui/button.tsx` | Botones con variantes |
| `Card` | `components/ui/card.tsx` | Contenedores de contenido |
| `Dialog` | `components/ui/dialog.tsx` | Modales |
| `Input` | `components/ui/input.tsx` | Campos de texto |
| `Label` | `components/ui/label.tsx` | Etiquetas de formulario |
| `Popover` | `components/ui/popover.tsx` | Menús flotantes |
| `Select` | `components/ui/select.tsx` | Selectores |
| `Table` | `components/ui/table.tsx` | Tablas de datos |
| `Textarea` | `components/ui/textarea.tsx` | Áreas de texto |
| `Tooltip` | `components/ui/tooltip.tsx` | Tooltips |

### Componentes Custom

| Componente | Archivo | Uso |
|---|---|---|
| `ConfirmDialog` | `components/ui/confirm-dialog.tsx` | Diálogo de confirmación para acciones destructivas |
| `EmptyState` | `components/ui/empty-state.tsx` | Estado vacío para listas |
| `Skeleton` | `components/ui/skeleton.tsx` | Loading placeholders |
| `PageTransition` | `components/ui/page-transition.tsx` | Animaciones de transición (framer-motion) |
| `CalendarView` | `components/calendar/calendar-view.tsx` | Vista de calendario (react-big-calendar) |

## Estado del Servidor (TanStack Query)

La aplicación usa TanStack Query para todo el estado del servidor. Configuración en `apps/web/src/app/providers.tsx:10-22`:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,       // 1 minuto
      gcTime: 10 * 60 * 1000,     // 10 minutos (cache)
      retry: 1,                    // 1 reintento
      refetchOnWindowFocus: false, // No refetch al cambiar de pestaña
    },
  },
});
```

## Custom Hooks

### use-clients (`hooks/use-clients.ts`)

| Hook | Query Key | Descripción |
|---|---|---|
| `useClients(search?)` | `['clients', search]` | Lista de clientes con búsqueda |
| `useClient(id)` | `['client', id]` | Cliente individual |
| `useCreateClient()` | - | Mutación: crear cliente |
| `useUpdateClient()` | - | Mutación: actualizar cliente |
| `useDeleteClient()` | - | Mutación: eliminar cliente |

### use-pets (`hooks/use-pets.ts`)

| Hook | Query Key | Descripción |
|---|---|---|
| `useCreatePet()` | - | Mutación: crear mascota para un cliente |
| `useDeletePet()` | - | Mutación: eliminar mascota (soft delete) |

### use-appointments (`hooks/use-appointments.ts`)

| Hook | Query Key | Descripción |
|---|---|---|
| `useAppointments(filters?)` | `['appointments', filters]` | Lista de citas con filtros |
| `useCalendar(startDate, endDate)` | `['calendar', start, end]` | Citas para vista calendario |
| `useAppointment(id)` | `['appointment', id]` | Cita individual |
| `useCreateAppointment()` | - | Mutación: crear cita |
| `useUpdateAppointment()` | - | Mutación: actualizar cita |
| `useDeleteAppointment()` | - | Mutación: cancelar cita |

### use-medical-records (`hooks/use-medical-records.ts`)

| Hook | Query Key | Descripción |
|---|---|---|
| `useMedicalRecords(petId)` | `['medical-records', petId]` | Expedientes por mascota |
| `useMedicalRecord(id)` | `['medical-record', id]` | Expediente individual |
| `useCreateMedicalRecord()` | - | Mutación: crear expediente |
| `useUpdateMedicalRecord()` | - | Mutación: actualizar expediente |

### use-inventory (`hooks/use-inventory.ts`)

| Hook | Query Key | Descripción |
|---|---|---|
| `useProducts(categoryId?)` | `['products', categoryId]` | Lista de productos |
| `useLowStock()` | `['low-stock']` | Productos con stock bajo |
| `useExpiringProducts(days?)` | `['expiring-products', days]` | Productos por caducar |
| `useCategories()` | `['categories']` | Categorías de productos |
| `useProduct(id)` | `['product', id]` | Producto individual |
| `useCreateProduct()` | - | Mutación: crear producto |
| `useUpdateProduct()` | - | Mutación: actualizar producto |
| `useAdjustStock()` | - | Mutación: ajustar stock |
| `useDeleteProduct()` | - | Mutación: eliminar producto |

### use-sales (`hooks/use-sales.ts`)

| Hook | Query Key | Descripción |
|---|---|---|
| `useSales(params?)` | `['sales', params]` | Lista de ventas |
| `useDailySummary(date?)` | `['daily-summary', date]` | Resumen de ventas del día |
| `useSale(id)` | `['sale', id]` | Venta individual |
| `useCreateSale()` | - | Mutación: crear venta |

### use-veterinarians (`hooks/use-veterinarians.ts`)

| Hook | Query Key | Descripción |
|---|---|---|
| `useVeterinarians()` | `['veterinarians']` | Lista de veterinarios (staleTime: 5 min) |

### use-debounce (`hooks/use-debounce.ts`)

| Hook | Descripción |
|---|---|
| `useDebounce<T>(value, delay=300)` | Debounce genérico con delay configurable |

Uso típico con búsqueda:

```typescript
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);
const { data } = useClients(debouncedSearch);
```

## Integración Socket.io

`apps/web/src/lib/socket.tsx:18-59`

El `SocketProvider` crea una conexión WebSocket con el namespace `/notifications` del backend:

```typescript
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';

const socket = io(`${SOCKET_URL}/notifications`, {
  auth: { token },         // JWT token desde localStorage
  transports: ['websocket', 'polling'],
  autoConnect: true,
});
```

### Uso en componentes

```typescript
import { useSocket } from '@/lib/socket';

function MiComponente() {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Unirse a una sala
    socket.emit('join:room', 'appointments');

    // Escuchar eventos
    socket.on('appointment:created', (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    });

    return () => {
      socket.emit('leave:room', 'appointments');
      socket.off('appointment:created');
    };
  }, [socket]);
}
```

## Sistema de Autenticación

`apps/web/src/lib/auth-context.tsx:32-83`

El `AuthProvider` maneja el estado de autenticación:

```typescript
const { user, token, isLoading, login, logout, isAuthenticated } = useAuth();
```

| Propiedad | Tipo | Descripción |
|---|---|---|
| `user` | `User \| null` | Datos del usuario actual |
| `token` | `string \| null` | JWT token |
| `isLoading` | `boolean` | Estado de carga inicial |
| `login(token, user)` | `function` | Guarda token y usuario en localStorage |
| `logout()` | `function` | Limpia localStorage y redirige a /login |
| `isAuthenticated` | `boolean` | `true` si hay token válido |

### Flujo de autenticación

1. El usuario ingresa credenciales en `/login`
2. Se llama a `authApi.login(email, password)`
3. En éxito, se llama `login(token, user)` del AuthProvider
4. Token se guarda en `localStorage.token`
5. Usuario se guarda en `localStorage.user`
6. Axios interceptor agrega `Authorization: Bearer <token>` a cada request
7. En 401, el interceptor limpia localStorage y redirige a `/login`

## API Client

`apps/web/src/lib/api.ts:1-132`

Cliente HTTP basado en axios con interceptores:

### Interceptores

- **Request**: Agrega `Authorization: Bearer <token>` desde localStorage
- **Response**: En error 401, limpia sesión y redirige a `/login`

### API Groups

| Grupo | Funciones |
|---|---|
| `authApi` | `login`, `register`, `getProfile` |
| `usersApi` | `getAll`, `getVeterinarians`, `getById`, `create`, `update`, `delete` |
| `clientsApi` | `getAll`, `getById`, `create`, `update`, `delete` |
| `petsApi` | `getAll`, `getById`, `create`, `update`, `addWeight`, `getVaccinations`, `addVaccination`, `delete` |
| `appointmentsApi` | `getAll`, `getCalendar`, `getById`, `create`, `update`, `delete` |
| `medicalRecordsApi` | `getByPet`, `getById`, `create`, `update` |
| `inventoryApi` | `getAll`, `getLowStock`, `getExpiring`, `getCategories`, `getById`, `create`, `update`, `delete`, `adjustStock`, `createCategory` |
| `salesApi` | `getAll`, `getDailySummary`, `getById`, `create`, `cancel` |

## Validación de Formularios

### Zod + react-hook-form

Esquemas de validación en `apps/web/src/lib/validations/`:

#### Client Schema (`lib/validations/client.ts`)

```typescript
const clientSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre es muy largo'),
  lastName: z.string().min(1, 'El apellido es requerido').max(50, 'El apellido es muy largo'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .max(15, 'El teléfono es muy largo')
    .regex(/^\d+$/, 'El teléfono solo debe contener números'),
  address: z.string().max(200, 'La dirección es muy larga').optional().or(z.literal('')),
  rfc: z.string().max(13, 'El RFC es muy largo').optional().or(z.literal('')),
});

type ClientFormValues = z.infer<typeof clientSchema>;
```

#### Pet Schema (`lib/validations/pet.ts`)

```typescript
const petSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre es muy largo'),
  species: z.string().min(1, 'La especie es requerida'),
  breed: z.string().max(50, 'La raza es muy larga').optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  weight: z.string().optional().or(z.literal(''))
    .transform((val) => (val ? parseFloat(val) : undefined)),
  microchip: z.string().max(20, 'El microchip es muy largo').optional().or(z.literal('')),
});

type PetFormValues = z.infer<typeof petSchema>;
```

#### Constantes de validación

```typescript
// speciesOptions en lib/validations/pet.ts:43-51
const speciesOptions = [
  { value: 'Perro', label: 'Perro' },
  { value: 'Gato', label: 'Gato' },
  { value: 'Ave', label: 'Ave' },
  { value: 'Conejo', label: 'Conejo' },
  { value: 'Hámster', label: 'Hámster' },
  { value: 'Reptil', label: 'Reptil' },
  { value: 'Otro', label: 'Otro' },
];

// genderOptions en lib/validations/pet.ts:53-56
const genderOptions = [
  { value: 'Macho', label: 'Macho' },
  { value: 'Hembra', label: 'Hembra' },
];
```

### Tipos de Cita

Constantes compartidas en `apps/web/src/lib/appointment-types.ts:3-9`:

```typescript
const appointmentTypes = [
  { value: 'CONSULTATION', label: 'Consulta', color: '#3b82f6', icon: Stethoscope },
  { value: 'URGENCY', label: 'Urgencia', color: '#ef4444', icon: AlertCircle },
  { value: 'SURGERY', label: 'Cirugía', color: '#8b5cf6', icon: Stethoscope },
  { value: 'VACCINATION', label: 'Vacunación', color: '#22c55e', icon: Syringe },
  { value: 'GROOMING', label: 'Estética', color: '#f59e0b', icon: Scissors },
];
```

## TypeScript Types

Todos los types están centralizados en `apps/web/src/types/index.ts:1-218`:

| Type | Descripción |
|---|---|
| `User` | Usuario del sistema (con rol, specialty, licenseNumber) |
| `Client` | Dueño de mascota (con pets opcionales) |
| `Pet` | Mascota (con relaciones: vaccinations, weightHistory, medicalRecords) |
| `Vaccination` | Registro de vacuna |
| `WeightRecord` | Registro de peso |
| `Appointment` | Cita médica (con pet.client, doctor) |
| `MedicalRecord` | Expediente clínico (SOAP) con attachments |
| `Attachment` | Archivo adjunto |
| `Category` | Categoría de producto |
| `Product` | Producto del inventario (con status) |
| `Sale` | Venta (con items, client, user) |
| `SaleItem` | Item de venta (con product) |
| `PaginatedResponse<T>` | Respuesta paginada genérica |
| `DailySummary` | Resumen diario de ventas |
| `CreateClientDto` | DTO para crear cliente |
| `UpdateClientDto` | DTO para actualizar cliente |
| `CreateAppointmentDto` | DTO para crear cita |
| `CreateSaleDto` | DTO para crear venta |
| `CreateProductDto` | DTO para crear producto |

## Testing (Vitest)

### Comandos

```bash
cd apps/web
pnpm test              # Ejecutar todos los tests
pnpm test:watch        # Modo watch
pnpm test:coverage     # Con reporte de cobertura
```

### Configuración

`apps/web/vitest.config.ts`:
- Environment: `jsdom`
- Setup: `./src/test/setup.ts`
- Include: `src/**/*.test.{ts,tsx}`
- Globals: `true` (describe, it, expect disponibles globalmente)
- Path alias: `@` → `./src`

### Setup (`src/test/setup.ts`)

Mocks globales para tests:
- `window.matchMedia` (mock para responsive hooks)
- `window.localStorage` (mock para auth tests)

### Tests existentes

| Archivo | Ubicación | Tests |
|---|---|---|
| `use-debounce.test.ts` | `hooks/__tests__/` | Valores iniciales, cambio de valor, cambio de delay, cleanup |
| `validations.test.ts` | `lib/__tests__/` | Schema de clientes (campos requeridos, formatos), schema de mascotas |
