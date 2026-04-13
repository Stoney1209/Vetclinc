# VetClinic Pro — Referencia del API

Documentación completa de todos los endpoints REST del backend.

## Información General

- **Base URL**: `http://localhost:4000/api`
- **Autenticación**: JWT Bearer Token (`Authorization: Bearer <token>`)
- **Formato de respuesta**: JSON
- **Documentación Swagger**: http://localhost:4000/docs (solo en desarrollo, `NODE_ENV !== 'production'`)
- **Rate limiting**: 10 req/s, 50 req/10s, 100 req/min

## Autenticación

### POST /auth/login

Iniciar sesión y obtener token JWT.

**Auth requerida**: No

**Request Body**:

```json
{
  "email": "admin@vetclinic.com",
  "password": "password123"
}
```

**Response** `200 OK`:

```json
{
  "user": {
    "id": "uuid",
    "email": "admin@vetclinic.com",
    "firstName": "Admin",
    "lastName": "VetClinic",
    "role": "ADMIN"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores**:

| Código | Mensaje | Causa |
|---|---|---|
| 401 | `Credenciales inválidas` | Email o contraseña incorrectos |
| 401 | `Usuario desactivado` | Usuario con `isActive: false` |

---

### POST /auth/register

Registrar nuevo usuario. **Requiere autenticación ADMIN** (`JwtAuthGuard` + `RolesGuard`).

**Auth requerida**: Sí — Roles: `ADMIN`

**Request Body**:

```json
{
  "email": "nuevo@vetclinic.com",
  "password": "password123",
  "firstName": "Nuevo",
  "lastName": "Usuario",
  "role": "VETERINARIAN",
  "specialty": "Cardiología",
  "licenseNumber": "Cédula-003"
}
```

**Response** `201 Created`:

```json
{
  "user": {
    "id": "uuid",
    "email": "nuevo@vetclinic.com",
    "firstName": "Nuevo",
    "lastName": "Usuario",
    "role": "VETERINARIAN"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errores**:

| Código | Mensaje |
|---|---|
| 401 | `Unauthorized` — Token inválido o faltante |
| 403 | `No tienes permisos para acceder a este recurso` |
| 409 | `El email ya está registrado` |

---

### GET /auth/profile

Obtener perfil del usuario autenticado.

**Auth requerida**: Sí — Todos los roles

**Response** `200 OK`:

```json
{
  "id": "uuid",
  "email": "admin@vetclinic.com",
  "firstName": "Admin",
  "lastName": "VetClinic",
  "role": "ADMIN",
  "specialty": null,
  "licenseNumber": null,
  "isActive": true,
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

---

## Usuarios

### GET /users

Listar todos los usuarios (paginado). Solo ADMIN.

**Auth requerida**: Sí — Roles: `ADMIN`

**Query Params**:

| Param | Tipo | Default | Descripción |
|---|---|---|---|
| `page` | number | 1 | Página |
| `limit` | number | 20 | Resultados por página |

**Response** `200 OK`:

```json
{
  "data": [
    {
      "id": "uuid",
      "email": "admin@vetclinic.com",
      "firstName": "Admin",
      "lastName": "VetClinic",
      "role": "ADMIN",
      "isActive": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 4,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### GET /users/veterinarians

Listar todos los veterinarios activos.

**Auth requerida**: Sí — Todos los roles

**Response** `200 OK`:

```json
[
  {
    "id": "uuid",
    "email": "dr.smith@vetclinic.com",
    "firstName": "Carlos",
    "lastName": "Smith",
    "role": "VETERINARIAN",
    "specialty": "Cirugía",
    "licenseNumber": "Cédula-001"
  }
]
```

---

### GET /users/:id

Obtener usuario por ID. Solo ADMIN.

**Auth requerida**: Sí — Roles: `ADMIN`

---

### POST /users

Crear nuevo usuario. Solo ADMIN.

**Auth requerida**: Sí — Roles: `ADMIN`

**Request Body**:

```json
{
  "email": "user@vetclinic.com",
  "password": "password123",
  "firstName": "Nombre",
  "lastName": "Apellido",
  "role": "RECEPTIONIST"
}
```

---

### PATCH /users/:id

Actualizar usuario. Solo ADMIN.

**Auth requerida**: Sí — Roles: `ADMIN`

---

### DELETE /users/:id

Desactivar usuario (soft delete, `isActive: false`). Solo ADMIN.

**Auth requerida**: Sí — Roles: `ADMIN`

---

## Clientes

### GET /clients

Listar clientes con búsqueda y paginación.

**Auth requerida**: Sí — Todos los roles

**Query Params**:

| Param | Tipo | Default | Descripción |
|---|---|---|---|
| `search` | string | - | Búsqueda por nombre, apellido o teléfono |
| `page` | number | 1 | Página |
| `limit` | number | 20 | Resultados por página |

---

### GET /clients/:id

Obtener cliente con sus mascotas.

**Auth requerida**: Sí — Todos los roles

**Response** `200 OK`:

```json
{
  "id": "uuid",
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan.perez@email.com",
  "phone": "5551234567",
  "address": "Calle Principal #123, Col. Centro, CDMX",
  "rfc": "XAXX010101XXX",
  "isActive": true,
  "pets": [
    {
      "id": "uuid",
      "name": "Max",
      "species": "Perro",
      "breed": "Labrador Retriever",
      "weight": 28.5
    }
  ]
}
```

---

### POST /clients

Crear nuevo cliente.

**Auth requerida**: Sí — Roles: `ADMIN`, `RECEPTIONIST`

**Request Body**:

```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan.perez@email.com",
  "phone": "5551234567",
  "address": "Calle Principal #123",
  "rfc": "XAXX010101XXX"
}
```

---

### PATCH /clients/:id

Actualizar datos del cliente.

**Auth requerida**: Sí — Roles: `ADMIN`, `RECEPTIONIST`

---

### DELETE /clients/:id

Desactivar cliente (soft delete).

**Auth requerida**: Sí — Roles: `ADMIN`

---

## Mascotas

### GET /pets

Listar mascotas con filtros y paginación.

**Auth requerida**: Sí — Todos los roles

**Query Params**:

| Param | Tipo | Descripción |
|---|---|---|
| `search` | string | Búsqueda por nombre |
| `species` | string | Filtrar por especie |
| `clientId` | string | Filtrar por dueño |
| `page` | number | Página |
| `limit` | number | Resultados por página |

---

### GET /pets/:id

Obtener mascota con historial completo (vacunas, peso, expedientes).

**Auth requerida**: Sí — Todos los roles

---

### POST /pets/client/:clientId

Crear mascota para un cliente.

**Auth requerida**: Sí — Roles: `ADMIN`, `VETERINARIAN`, `RECEPTIONIST`

**Request Body**:

```json
{
  "name": "Max",
  "species": "Perro",
  "breed": "Labrador Retriever",
  "dateOfBirth": "2020-05-15T00:00:00.000Z",
  "gender": "Macho",
  "color": "Dorado",
  "weight": 28.5,
  "microchip": "123456789012345",
  "notes": "Mascota muy amigable"
}
```

---

### PATCH /pets/:id

Actualizar datos de la mascota.

**Auth requerida**: Sí — Roles: `ADMIN`, `VETERINARIAN`, `RECEPTIONIST`

---

### POST /pets/:id/weight

Registrar nuevo peso. Usa transacción Prisma para crear el registro y actualizar el campo `weight` del Pet de forma atómica.

**Auth requerida**: Sí — Roles: `ADMIN`, `VETERINARIAN`

**Request Body**:

```json
{
  "weight": 28.5,
  "notes": "Control de peso mensual"
}
```

---

### GET /pets/:id/vaccinations

Obtener historial de vacunas de una mascota.

**Auth requerida**: Sí — Todos los roles

**Response** `200 OK`:

```json
[
  {
    "id": "uuid",
    "vaccineName": "Rabia",
    "batch": "RAB-2024-001",
    "applicationDate": "2024-01-15T00:00:00.000Z",
    "nextDueDate": "2025-01-15T00:00:00.000Z",
    "veterinarian": "Dr. Carlos Smith"
  }
]
```

---

### POST /pets/:id/vaccinations

Registrar nueva vacuna.

**Auth requerida**: Sí — Roles: `ADMIN`, `VETERINARIAN`

**Request Body**:

```json
{
  "vaccineName": "Rabia",
  "batch": "RAB-2024-001",
  "applicationDate": "2024-01-15T00:00:00.000Z",
  "nextDueDate": "2025-01-15T00:00:00.000Z",
  "veterinarian": "Dr. Carlos Smith",
  "notes": "Refuerzo anual"
}
```

---

### DELETE /pets/:id

Desactivar mascota (soft delete).

**Auth requerida**: Sí — Roles: `ADMIN`

---

## Citas

### GET /appointments

Listar citas con filtros (paginado).

**Auth requerida**: Sí — Todos los roles

**Query Params**:

| Param | Tipo | Descripción |
|---|---|---|
| `startDate` | string (ISO 8601) | Fecha de inicio |
| `endDate` | string (ISO 8601) | Fecha de fin |
| `doctorId` | string | Filtrar por doctor |
| `status` | string | Filtrar por estado (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW) |
| `page` | number | Página |
| `limit` | number | Resultados por página |

---

### GET /appointments/calendar

Obtener citas para vista de calendario. Retorna `Appointment[]` directamente **sin paginación**.

**Auth requerida**: Sí — Todos los roles

**Query Params**: `startDate` (requerido), `endDate` (requerido)

**Response** `200 OK`:

```json
[
  {
    "id": "uuid",
    "dateTime": "2024-12-20T10:00:00.000Z",
    "duration": 30,
    "type": "CONSULTATION",
    "status": "SCHEDULED",
    "colorCode": "#3b82f6",
    "pet": {
      "id": "uuid",
      "name": "Max",
      "client": {
        "id": "uuid",
        "firstName": "Juan",
        "lastName": "Pérez",
        "phone": "5551234567"
      }
    },
    "doctor": {
      "id": "uuid",
      "firstName": "Carlos",
      "lastName": "Smith",
      "specialty": "Cirugía"
    },
    "room": {
      "id": "uuid",
      "name": "Consultorio 1"
    }
  }
]
```

> **Nota**: Este endpoint no usa paginación. Retorna todas las citas en el rango de fechas para renderizado directo del calendario.

---

### GET /appointments/:id

Obtener cita por ID.

**Auth requerida**: Sí — Todos los roles

---

### POST /appointments

Crear nueva cita.

**Auth requerida**: Sí — Roles: `ADMIN`, `VETERINARIAN`, `RECEPTIONIST`

**Request Body**:

```json
{
  "petId": "uuid",
  "doctorId": "uuid",
  "dateTime": "2024-12-20T10:00:00.000Z",
  "duration": 30,
  "type": "CONSULTATION",
  "notes": "Control anual",
  "colorCode": "#3b82f6"
}
```

**Tipos de cita**: `URGENCY`, `CONSULTATION`, `SURGERY`, `VACCINATION`, `GROOMING`

**Emite evento WebSocket**: `appointment:created` en sala `appointments`

---

### PATCH /appointments/:id

Actualizar cita.

**Auth requerida**: Sí — Roles: `ADMIN`, `VETERINARIAN`, `RECEPTIONIST`

**Emite evento WebSocket**: `appointment:updated` en sala `appointments`

---

### DELETE /appointments/:id

Cancelar cita (cambia status a `CANCELLED`).

**Auth requerida**: Sí — Roles: `ADMIN`, `VETERINARIAN`, `RECEPTIONIST`

**Emite evento WebSocket**: `appointment:deleted` en sala `appointments`

---

### POST /appointments/:id/confirm

Confirmar una cita (marca como confirmada).

**Auth requerida**: Sí — Todos los roles autenticados

**Response** `200 OK`:
```json
{
  "id": "uuid",
  "dateTime": "2024-12-20T10:00:00.000Z",
  "confirmedAt": "2024-12-20T09:30:00.000Z",
  "confirmationChannel": "EMAIL",
  ...
}
```

---

### POST /appointments/:id/resend-confirmation

Reenviar notificación de confirmación de cita.

**Auth requerida**: Sí — Roles: `ADMIN`, `RECEPTIONIST`

---

## Expedientes Médicos

### GET /medical-records/pet/:petId

Obtener expedientes de una mascota.

**Auth requerida**: Sí — Todos los roles

**Query Params**: `page`, `limit`

**Response** `200 OK`:

```json
{
  "data": [
    {
      "id": "uuid",
      "subjective": "Dueño reporta letargia...",
      "objective": "Temperatura 38.9°C...",
      "assessment": "Posible gastritis...",
      "plan": "1. Hemograma completo...",
      "diagnosis": "Gastritis - Probable",
      "treatment": "Omeprazol 1mg/kg...",
      "recordDate": "2024-01-15T10:00:00.000Z",
      "veterinarian": {
        "id": "uuid",
        "firstName": "Carlos",
        "lastName": "Smith"
      },
      "attachments": []
    }
  ],
  "meta": { ... }
}
```

---

### GET /medical-records/:id

Obtener expediente por ID.

**Auth requerida**: Sí — Todos los roles

---

### POST /medical-records

Crear expediente clínico (formato SOAP).

**Auth requerida**: Sí — Roles: `ADMIN`, `VETERINARIAN`

**Request Body**:

```json
{
  "petId": "uuid",
  "appointmentId": "uuid",
  "subjective": "Dueño reporta que Max ha estado más letárgico...",
  "objective": "Temperatura 38.9°C, mucosas ligeramente pálidas...",
  "assessment": "Posible gastritis o inicio de enfermedad inflamatoria intestinal...",
  "plan": "1. Hemograma completo\n2. Perfil bioquímico...",
  "diagnosis": "Gastritis - Probable",
  "treatment": "Omeprazol 1mg/kg cada 24hrs por 7 días..."
}
```

**Emite evento WebSocket**: `record:created` en sala `medical-records`

---

### PATCH /medical-records/:id

Actualizar expediente.

**Auth requerida**: Sí — Roles: `ADMIN`, `VETERINARIAN`

---

### PATCH /medical-records/:id/follow-up

Programar fecha de seguimiento para un expediente.

**Auth requerida**: Sí — Roles: `ADMIN`, `VETERINARIAN`

**Request Body**:
```json
{
  "followUpDate": "2024-02-15T10:00:00.000Z",
  "followUpNotes": "Control de evolución post-tratamiento"
}
```

---

### GET /medical-records/follow-ups/upcoming

Obtener seguimientos próximos (próximos 7 días).

**Auth requerida**: Sí — Todos los roles

---

## Prescripciones

### POST /prescriptions

Crear una prescripción médica.

**Auth requerida**: Sí — Roles: `ADMIN`, `VETERINARIAN`

**Request Body**:
```json
{
  "medicalRecordId": "uuid",
  "notes": "Seguir indicaciones estrictamente",
  "items": [
    {
      "productName": "Amoxicilina 500mg",
      "dosage": "500mg",
      "frequency": "cada 8 horas",
      "duration": "7 días",
      "quantity": 21,
      "instructions": "Tomar con alimentos",
      "productId": "uuid"
    }
  ]
}
```

---

### GET /prescriptions/medical-record/:recordId

Obtener prescripciones de un expediente.

**Auth requerida**: Sí — Todos los roles

---

### GET /prescriptions/:id

Obtener prescripción por ID.

**Auth requerida**: Sí — Todos los roles

---

## Reportes

### GET /inventory

Listar productos con paginación.

**Auth requerida**: Sí — Todos los roles

**Query Params**: `categoryId`, `page`, `limit`

---

### GET /inventory/low-stock

Obtener productos con stock bajo (`stock < minStock`).

**Auth requerida**: Sí — Todos los roles

**Emite evento WebSocket**: `stock:low` en sala `inventory` cuando se detecta stock bajo.

---

### GET /inventory/expiring

Obtener productos próximos a caducar.

**Auth requerida**: Sí — Todos los roles

**Query Params**: `days` (default: 30)

---

### GET /inventory/categories

Listar todas las categorías.

**Auth requerida**: Sí — Todos los roles

---

### GET /inventory/:id

Obtener producto por ID.

**Auth requerida**: Sí — Todos los roles

---

### POST /inventory

Crear nuevo producto.

**Auth requerida**: Sí — Roles: `ADMIN`, `INVENTORY_MANAGER`

**Request Body**:

```json
{
  "name": "Amoxicilina 500mg",
  "sku": "AMOX-500-24",
  "description": "Antibiótico de amplio espectro",
  "price": 150.00,
  "cost": 95.00,
  "stock": 50,
  "minStock": 10,
  "categoryId": "uuid",
  "expiryDate": "2026-12-31T00:00:00.000Z",
  "batch": "LOTE-2024-A"
}
```

---

### POST /inventory/categories

Crear nueva categoría.

**Auth requerida**: Sí — Roles: `ADMIN`, `INVENTORY_MANAGER`

**Request Body**:

```json
{
  "name": "Medicamentos",
  "type": "medicine"
}
```

---

### PATCH /inventory/:id

Actualizar producto.

**Auth requerida**: Sí — Roles: `ADMIN`, `INVENTORY_MANAGER`

---

### PATCH /inventory/:id/adjust-stock

Ajustar stock de un producto.

**Auth requerida**: Sí — Roles: `ADMIN`, `INVENTORY_MANAGER`

**Request Body**:

```json
{
  "quantity": 10,
  "reason": "Reposición de inventario"
}
```

---

### DELETE /inventory/:id

Eliminar producto (soft delete).

**Auth requerida**: Sí — Roles: `ADMIN`, `INVENTORY_MANAGER`

---

## Ventas

### GET /sales

Listar ventas con filtros de fecha.

**Auth requerida**: Sí — Todos los roles

**Query Params**: `startDate`, `endDate`, `page`, `limit`

---

### GET /sales/daily-summary

Resumen de ventas del día.

**Auth requerida**: Sí — Todos los roles

**Query Params**: `date` (default: hoy)

**Response** `200 OK`:

```json
{
  "date": "2024-01-15",
  "totalSales": 1250.00,
  "totalTax": 200.00,
  "totalItems": 15,
  "salesCount": 5,
  "salesByPayment": {
    "efectivo": 800.00,
    "tarjeta": 450.00
  }
}
```

---

### GET /sales/:id

Obtener venta por ID.

**Auth requerida**: Sí — Todos los roles

---

### GET /sales/:id/receipt

Generar ticket PDF de una venta.

**Auth requerida**: Sí — Todos los roles

**Response**: `application/pdf` (stream)

---

### POST /sales

Crear nueva venta con **transacción atómica**. Verifica stock, descuenta productos y registra la venta en una sola transacción.

**Auth requerida**: Sí — Todos los roles

**Request Body**:

```json
{
  "clientId": "uuid",
  "paymentMethod": "efectivo",
  "items": [
    { "productId": "uuid", "quantity": 2 },
    { "productId": "uuid", "quantity": 1 }
  ]
}
```

**Emite evento WebSocket**: `sale:created` en sala `sales`

**Errores**:

| Código | Mensaje | Causa |
|---|---|---|
| 400 | `La venta debe tener al menos un producto` | items vacío |
| 400 | `Algunos productos no fueron encontrados` | productId inválido |
| 400 | `Stock insuficiente para {name}. Disponible: {stock}` | Stock insuficiente |

---

### PATCH /sales/:id/cancel

Cancelar venta y restaurar inventario con **transacción atómica**. Restaura el stock de todos los productos.

**Auth requerida**: Sí — Roles: `ADMIN`

**Errores**:

| Código | Mensaje | Causa |
|---|---|---|
| 404 | `Venta no encontrada` | ID no existe |
| 400 | `La venta ya está cancelada` | Venta previamente cancelada |

---

## Reportes

### GET /reports/dashboard

Obtener KPIs del dashboard.

**Auth requerida**: Sí — Todos los roles

**Response** `200 OK`:
```json
{
  "appointments": { "today": 12, "yesterday": 10, "delta": 20 },
  "revenue": { "currentMonth": 45000, "previousMonth": 38000, "delta": 18.4 },
  "clients": { "newThisMonth": 5, "total": 45 },
  "noShowRate": { "rate": 8.5, "noShows": 12, "completed": 140 },
  "followUps": { "pending": 3 },
  "confirmation": { "unconfirmed": 7 }
}
```

---

### GET /reports/revenue

Obtener ingresos por día.

**Auth requerida**: Sí — Todos los roles

**Query Params**: `days` (default: 7)

**Response** `200 OK`:
```json
[
  { "date": "2024-01-15", "total": 1250.00 },
  { "date": "2024-01-16", "total": 980.00 }
]
```

---

### GET /reports/appointments-by-type

Obtener conteo de citas por tipo.

**Auth requerida**: Sí — Todos los roles

**Query Params**: `days` (default: 30)

**Response** `200 OK`:
```json
[
  { "type": "CONSULTATION", "count": 45 },
  { "type": "SURGERY", "count": 12 },
  { "type": "VACCINATION", "count": 28 }
]
```

---

## Uploads

### POST /uploads/medical-record/:recordId

Subir archivo adjunto a un expediente.

**Auth requerida**: Sí — Todos los roles

**Content-Type**: `multipart/form-data`

**Restricciones**:

- Tamaño máximo: 5 MB
- Tipos permitidos: .jpg, .jpeg, .png, .gif, .webp, .pdf
- MIME types: image/jpeg, image/png, image/gif, image/webp, application/pdf

**Response** `201 Created`:

```json
{
  "id": "uuid",
  "fileName": "radiografia.png",
  "fileUrl": "/api/uploads/medical-records/uuid.png",
  "fileType": "image/png",
  "fileSize": 1024000,
  "uploadedAt": "2024-01-15T10:00:00.000Z",
  "medicalRecordId": "uuid"
}
```

**Errores**:

| Código | Mensaje | Causa |
|---|---|---|
| 400 | `Archivo requerido` | No se envió archivo |
| 400 | `Tipo de archivo no permitido` | Extensión no válida |
| 400 | `Tipo MIME no permitido` | MIME type no válido |
| 400 | `Expediente no encontrado` | recordId no existe |

---

### GET /uploads/medical-records/:filename

Obtener archivo adjunto.

**Auth requerida**: Sí — Todos los roles

**Protección**: Validación contra path traversal (rechaza `..`, `/`, `\` en el nombre). Verificación de resolved path dentro del directorio de uploads.

**Response**: `image/*` o `application/pdf` (inline)

---

## Eventos WebSocket

Namespace: `/notifications`

### Autenticación

Conectar con JWT en el handshake:

```typescript
const socket = io('http://localhost:4000/notifications', {
  auth: { token: '<jwt-token>' },
});
```

Si el token es inválido, el servidor desconecta al cliente. CORS se configura desde `CORS_ORIGINS` env var.

### Salas disponibles

Unirse con: `socket.emit('join:room', 'appointments')`

| Sala | Descripción |
|---|---|
| `appointments` | Eventos de citas |
| `inventory` | Alertas de inventario |
| `sales` | Eventos de ventas |
| `medical-records` | Expedientes nuevos |
| `clients` | Recordatorios de vacunas |

### Eventos emitidos por el servidor

| Evento | Sala | Payload | Trigger |
|---|---|---|---|
| `appointment:created` | appointments | Appointment | POST /appointments |
| `appointment:updated` | appointments | Appointment | PATCH /appointments/:id |
| `appointment:deleted` | appointments | `{ id: string }` | DELETE /appointments/:id |
| `stock:low` | inventory | Product | Detectado en operaciones de stock |
| `sale:created` | sales | Sale | POST /sales |
| `record:created` | medical-records | MedicalRecord | POST /medical-records |
| `vaccination:reminder` | clients | `{ pet, vaccination }` | Según fechas de vacunas |

### Ejemplo de uso en el cliente

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000/notifications', {
  auth: { token: localStorage.getItem('token') },
});

socket.on('connect', () => {
  socket.emit('join:room', 'appointments');
});

socket.on('appointment:created', (appointment) => {
  console.log('Nueva cita:', appointment);
  // Refrescar lista de citas
});

socket.on('stock:low', (product) => {
  console.warn('Stock bajo:', product.name);
  // Mostrar notificación
});
```

## Códigos de Respuesta HTTP

| Código | Descripción |
|---|---|
| `200` | OK — Solicitud exitosa |
| `201` | Created — Recurso creado |
| `400` | Bad Request — Datos inválidos |
| `401` | Unauthorized — Token inválido o faltante |
| `403` | Forbidden — Sin permisos para el recurso |
| `404` | Not Found — Recurso no encontrado |
| `409` | Conflict — Registro duplicado (email, SKU, etc.) |
| `429` | Too Many Requests — Rate limit excedido |
| `500` | Internal Server Error — Error interno del servidor |

## Formato de Error

Todos los errores siguen esta estructura (`AllExceptionsFilter`):

```json
{
  "statusCode": 409,
  "error": "Conflict",
  "message": ["Ya existe un registro con ese email"],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

`message` siempre es un array de strings.

### Códigos de error Prisma mapeados

| Código Prisma | HTTP Status | Mensaje |
|---|---|---|
| `P2002` | 409 Conflict | `Ya existe un registro con ese {fields}` |
| `P2025` | 404 Not Found | `Registro no encontrado` |
| `P2003` | 400 Bad Request | `Referencia inválida: el registro relacionado no existe` |
| `P2014` | 400 Bad Request | `La operación violaría una relación requerida` |
| `P2021` | 500 Internal | `Error de esquema en la base de datos` |
| `P2022` | 500 Internal | `Columna no encontrada en la base de datos` |
