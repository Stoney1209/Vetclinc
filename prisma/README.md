# VetClinic Pro — Base de Datos

Documentación del esquema de base de datos PostgreSQL gestionado con Prisma ORM.

## Schema Overview

El esquema define **15 modelos** organizados en 4 dominios:

- **Autenticación y usuarios**: `User`
- **CRM veterinario**: `Client`, `Pet`, `WeightHistory`, `Vaccination`
- **Agenda y expedientes**: `Room`, `Appointment`, `MedicalRecord`, `Attachment`
- **Inventario y ventas**: `Category`, `Product`, `Sale`, `SaleItem`
- **Prescripciones**: `Prescription`, `PrescriptionItem`
- **Auditoría**: `NotificationLog`, `RefreshToken`, `BlacklistedToken`

## Diagrama de Relaciones

```mermaid
erDiagram
    User ||--o{ Appointment : "es doctor en"
    User ||--o{ MedicalRecord : "es veterinario en"
    User ||--o{ Sale : "registra"
    User ||--o{ Prescription : "prescribe"

    Client ||--o{ Pet : "esdueño de"
    Client ||--o{ Sale : "realiza"

    Pet ||--o{ WeightHistory : "registra peso"
    Pet ||--o{ Vaccination : "recibe"
    Pet ||--o{ Appointment : "tiene cita"
    Pet ||--o{ MedicalRecord : "tiene expediente"

    Room ||--o{ Appointment : "ubicación de"

    Appointment ||o--|| MedicalRecord : "genera"

    MedicalRecord ||--o{ Attachment : "contiene"
    MedicalRecord ||--o{ Prescription : "contiene"

    Category ||--o{ Product : "agrupa"

    Product ||--o{ SaleItem : "vendido como"
    Product ||--o{ PrescriptionItem : "prescrito como"
    Sale ||--o{ SaleItem : "contiene"
    Prescription ||--o{ PrescriptionItem : "contiene"
```

## Modelos

### Enumeraciones

```prisma
enum Role {
  ADMIN
  VETERINARIAN
  RECEPTIONIST
  INVENTORY_MANAGER
}

enum AppointmentType {
  URGENCY
  CONSULTATION
  SURGERY
  VACCINATION
  GROOMING
}

enum AppointmentStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}

enum StockStatus {
  IN_STOCK
  LOW_STOCK
  OUT_OF_STOCK
  EXPIRED
}
```

### User

Usuarios del sistema con autenticación por email/password.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | String (UUID) | Auto | Identificador único |
| `email` | String | Sí | Email único |
| `password` | String | Sí | Hash bcrypt |
| `firstName` | String | Sí | Nombre |
| `lastName` | String | Sí | Apellido |
| `role` | Role (enum) | Default: RECEPTIONIST | Rol del usuario |
| `specialty` | String? | No | Especialidad (veterinarios) |
| `licenseNumber` | String? | No | Cédula profesional |
| `isActive` | Boolean | Default: true | Soft delete |
| `createdAt` | DateTime | Auto | Fecha de creación |
| `updatedAt` | DateTime | Auto | Fecha de actualización |

**Relaciones**: `appointments`, `medicalRecords`, `sales`
**Índices**: `email` (único), `role`, `isActive`
**Tabla**: `users`

### Client

Dueños de mascotas.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | String (UUID) | Auto | Identificador único |
| `firstName` | String | Sí | Nombre |
| `lastName` | String | Sí | Apellido |
| `email` | String? | No | Email |
| `phone` | String | Sí | Teléfono |
| `address` | String? | No | Dirección |
| `rfc` | String? | No | RFC (facturación) |
| `isActive` | Boolean | Default: true | Soft delete |
| `createdAt` | DateTime | Auto | Fecha de creación |
| `updatedAt` | DateTime | Auto | Fecha de actualización |

**Relaciones**: `pets`, `sales`
**Índices**: `phone`, `isActive`, `firstName + lastName`
**Tabla**: `clients`

### Pet

Mascotas registradas.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | String (UUID) | Auto | Identificador único |
| `name` | String | Sí | Nombre de la mascota |
| `species` | String | Sí | Especie (Perro, Gato, etc.) |
| `breed` | String? | No | Raza |
| `dateOfBirth` | DateTime? | No | Fecha de nacimiento |
| `gender` | String? | No | Género |
| `color` | String? | No | Color |
| `weight` | Float? | No | Peso actual (kg) |
| `microchip` | String? | No | Número de microchip |
| `photoUrl` | String? | No | URL de foto |
| `notes` | String? | No | Notas adicionales |
| `isActive` | Boolean | Default: true | Soft delete |
| `clientId` | String | Sí | Dueño (FK) |

**Relaciones**: `client`, `medicalRecords`, `vaccinations`, `appointments`, `weightHistory`
**Índices**: `clientId`, `species`, `isActive`, `name`
**Tabla**: `pets`

### WeightHistory

Historial de peso de una mascota.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | String (UUID) | Auto | Identificador único |
| `weight` | Float | Sí | Peso en kg |
| `recordedAt` | DateTime | Default: now | Fecha del registro |
| `notes` | String? | No | Notas |
| `petId` | String | Sí | Mascota (FK) |

**Tabla**: `weight_history`

> **Nota**: El servicio `pets.service.ts:126-141` usa una transacción Prisma para crear el registro de peso y actualizar el campo `weight` del Pet de forma atómica.

### Vaccination

Registro de vacunas aplicadas.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | String (UUID) | Auto | Identificador único |
| `vaccineName` | String | Sí | Nombre de la vacuna |
| `batch` | String? | No | Lote |
| `applicationDate` | DateTime | Sí | Fecha de aplicación |
| `nextDueDate` | DateTime? | No | Próxima dosis |
| `veterinarian` | String? | No | Veterinario aplicador |
| `notes` | String? | No | Notas |
| `documentUrl` | String? | No | URL de documento |
| `petId` | String | Sí | Mascota (FK) |

**Tabla**: `vaccinations`

### Room

Consultorios y quirófanos.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | String (UUID) | Auto | Identificador único |
| `name` | String | Sí | Nombre del consultorio |
| `isActive` | Boolean | Default: true | Estado |

**Relaciones**: `appointments`
**Tabla**: `rooms`

### Appointment

Citas médicas programadas.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | String (UUID) | Auto | Identificador único |
| `dateTime` | DateTime | Sí | Fecha y hora |
| `duration` | Int | Sí | Duración en minutos |
| `type` | AppointmentType (enum) | Sí | Tipo de cita |
| `status` | AppointmentStatus | Default: SCHEDULED | Estado |
| `notes` | String? | No | Notas |
| `colorCode` | String? | No | Color para calendario |
| `petId` | String | Sí | Mascota (FK) |
| `doctorId` | String | Sí | Veterinario (FK → User) |
| `roomId` | String? | No | Consultorio (FK) |

**Relaciones**: `pet`, `doctor`, `room`, `medicalRecord`
**Índices**: `dateTime`, `petId`, `doctorId`, `status`, `roomId`
**Tabla**: `appointments`

### MedicalRecord

Expedientes clínicos con formato SOAP.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | String (UUID) | Auto | Identificador único |
| `subjective` | Text? | No | S - Subjetivo: lo que reporta el dueño |
| `objective` | Text? | No | O - Objetivo: hallazgos del examen |
| `assessment` | Text? | No | A - Evaluación: diagnóstico diferencial |
| `plan` | Text? | No | P - Plan: tratamiento y seguimiento |
| `recordDate` | DateTime | Default: now | Fecha del registro |
| `diagnosis` | String? | No | Diagnóstico final |
| `treatment` | Text? | No | Tratamiento indicado |
| `appointmentId` | String? | No | Cita asociada (FK, único) |
| `petId` | String | Sí | Mascota (FK) |
| `veterinarianId` | String | Sí | Veterinario (FK → User) |

**Relaciones**: `appointment`, `pet`, `veterinarian`, `attachments`
**Tabla**: `medical_records`

### Attachment

Archivos adjuntos a expedientes.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | String (UUID) | Auto | Identificador único |
| `fileName` | String | Sí | Nombre original del archivo |
| `fileUrl` | String | Sí | URL del archivo |
| `fileType` | String | Sí | MIME type |
| `fileSize` | Int | Sí | Tamaño en bytes |
| `uploadedAt` | DateTime | Default: now | Fecha de carga |
| `medicalRecordId` | String | Sí | Expediente (FK) |

**Tabla**: `attachments`

### Category

Categorías de productos.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | String (UUID) | Auto | Identificador único |
| `name` | String | Sí | Nombre de la categoría |
| `type` | String | Sí | Tipo (medicine, supply, food, etc.) |

**Relaciones**: `products`
**Tabla**: `categories`

### Product

Productos del inventario.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | String (UUID) | Auto | Identificador único |
| `name` | String | Sí | Nombre del producto |
| `sku` | String | Sí | SKU único |
| `description` | String? | No | Descripción |
| `price` | Decimal(10,2) | Sí | Precio de venta |
| `cost` | Decimal(10,2)? | No | Costo |
| `stock` | Int | Default: 0 | Stock actual |
| `minStock` | Int | Default: 5 | Stock mínimo (alerta) |
| `expiryDate` | DateTime? | No | Fecha de caducidad |
| `batch` | String? | No | Lote |
| `status` | StockStatus | Default: IN_STOCK | Estado de stock |
| `imageUrl` | String? | No | URL de imagen |
| `categoryId` | String | Sí | Categoría (FK) |

**Relaciones**: `category`, `saleItems`
**Índices**: `categoryId` (único), `status`, `expiryDate`, `name`
**Tabla**: `products`

### Sale

Ventas registradas. Las operaciones `create()` y `cancel()` usan transacciones Prisma (`sales.service.ts`).

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | String (UUID) | Auto | Identificador único |
| `subtotal` | Decimal(10,2) | Sí | Subtotal antes de impuestos |
| `tax` | Decimal(10,2) | Sí | IVA (16%) |
| `total` | Decimal(10,2) | Sí | Total |
| `paymentMethod` | String? | No | Método de pago |
| `status` | String | Default: "completed" | Estado de la venta |
| `clientId` | String? | No | Cliente (FK) |
| `userId` | String | Sí | Usuario que registra (FK) |

**Relaciones**: `client`, `items`, `user`
**Índices**: `clientId`, `userId`, `createdAt`, `status`
**Tabla**: `sales`

### SaleItem

Detalle de cada venta.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | String (UUID) | Auto | Identificador único |
| `quantity` | Int | Sí | Cantidad |
| `unitPrice` | Decimal(10,2) | Sí | Precio unitario |
| `subtotal` | Decimal(10,2) | Sí | Subtotal (quantity × unitPrice) |
| `saleId` | String | Sí | Venta (FK) |
| `productId` | String | Sí | Producto (FK) |

**Índices**: `saleId`, `productId`
**Tabla**: `sale_items`

## Flujo de Migraciones

Las migraciones se gestionan desde el directorio `apps/api/`:

```bash
# Crear nueva migración
npx prisma migrate dev --name <nombre_migracion>

# Aplicar migraciones pendientes (producción)
npx prisma migrate deploy

# Generar cliente Prisma después de cambios en schema
npx prisma generate

# Push directo del schema (sin migración, útil en desarrollo)
npx prisma db push

# Ver estado de migraciones
npx prisma migrate status

# Abrir Prisma Studio (GUI)
npx prisma studio
```

El schema se encuentra en `prisma/schema.prisma` y se comparte entre ambas aplicaciones.

## Datos de Prueba (Seed)

El seed se ejecuta con `pnpm db:seed` desde la raíz del proyecto.

### Usuarios creados

| Rol | Email | Nombre |
|---|---|---|
| ADMIN | admin@vetclinic.com | Admin VetClinic |
| VETERINARIAN | dr.smith@vetclinic.com | Carlos Smith |
| VETERINARIAN | dra.lopez@vetclinic.com | María López |
| RECEPTIONIST | reception@vetclinic.com | Ana García |

Todos los usuarios tienen la contraseña: `password123` (hash bcrypt con salt rounds: 10).

### Consultorios

- Consultorio 1
- Consultorio 2
- Quirófano

### Categorías

- Medicamentos (type: medicine)
- Material de curación (type: supply)
- Alimentos (type: food)

### Productos de ejemplo

| Nombre | SKU | Precio | Stock | Categoría |
|---|---|---|---|---|
| Amoxicilina 500mg | AMOX-500-24 | $150.00 | 50 | Medicamentos |
| Meloxicam 15mg | MELOX-15-20 | $120.00 | 35 | Medicamentos |
| Vacuna Rabia | VAC-RAB-10 | $200.00 | 25 | Medicamentos |
| Gasa estéril | GASA-EST-100 | $45.00 | 100 | Material de curación |
| Alcohol 70% | ALC-70-1L | $65.00 | 30 | Material de curación |
| Alimento Premium Perros | ALIM-PERP-10K | $450.00 | 15 | Alimentos |

### Clientes y mascotas

| Cliente | Mascotas |
|---|---|
| Juan Pérez | Max (Labrador Retriever, 28.5kg), Luna (Persa, 4.2kg) |
| Sofía Rodríguez | Rocky (Bulldog Francés, 12.3kg) |
| Miguel Hernández | Mimi (Siamés, 3.8kg) |

El seed también crea registros de historial de peso, vacunas, citas programadas y un expediente médico de ejemplo.
