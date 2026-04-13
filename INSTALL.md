# VetClinic Pro - Guía de Instalación para Windows

## Requisitos del Sistema

| Componente | Requerimiento |
|------------|----------------|
| Sistema Operativo | Windows 11 Pro |
| Procesador | 4+ núcleos |
| RAM | 8 GB |
| Disco | 50 GB SSD libre |

## Instalación Manual (3 pasos previos)

### 1. Instalar Node.js 20 LTS
- Descargar desde: https://nodejs.org/dist/v20.18.1/node-v20.18.1-x64.msi
- Ejecutar el instalador (siguiente, siguiente...)

### 2. Instalar PostgreSQL 16
- Descargar desde: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
- Durante la instalación:
  - Puerto: **5432**
  - Contraseña para usuario `postgres`: **VetClinic2024!**
  - Stack Builder: **Omitir** (no necesario)

### 3. Descargar el proyecto
- Copiar esta carpeta completa a la PC de recepción

---

## Instalación Automatizada

### Opción 1: Con auto-inicio (recomendado)
```powershell
# Ejecutar como Administrador
.\install-vetclinic.ps1 -AUTO_START
```

### Opción 2: Sin auto-inicio
```powershell
# Ejecutar como Administrador
.\install-vetclinic.ps1
```

---

## Comandos de Uso

### Iniciar VetClinic
```powershell
.\start-vetclinic.ps1
```

### Detener VetClinic
```powershell
.\stop-vetclinic.ps1
```

### Realizar backup
```powershell
.\backup-db.ps1
```

---

## Acceso a la Aplicación

| Dispositivo | URL |
|-------------|-----|
| Misma PC | http://localhost:3000 |
| Red local | http://192.168.X.X:3000 |

### Credenciales por defecto
- **Email**: admin@vetclinic.com
- **Password**: password123

---

## Estructura de Archivos

```
vetclinic/
├── apps/
│   ├── api/          # Backend (NestJS)
│   └── web/          # Frontend (Next.js)
├── prisma/           # Base de datos
├── install-vetclinic.ps1   # Script de instalación
├── start-vetclinic.ps1     # Script de inicio
├── stop-vetclinic.ps1      # Script de parada
├── backup-db.ps1           # Script de backup
├── logs/                   # Logs de la aplicación
└── backups/               # Backups de la base de datos
```

---

## Solución de Problemas

### PostgreSQL no inicia
1. Abrir "Servicios" en Windows
2. Buscar "PostgreSQL" 
3. Clic derecho → Iniciar

### Puertos en uso
```powershell
# Ver qué proceso usa el puerto 3000
netstat -ano | findstr :3000

# Matar el proceso
taskkill /PID [NUMERO_PID] /F
```

### Error de conexión a base de datos
Verificar que el servicio de PostgreSQL esté ejecutándose:
```powershell
Get-Service -Name postgresql*
```

---

## Mantenimiento

### Backup manual
Ejecutar `.\backup-db.ps1` periódicamente (recomendado: diario)

### Actualizar aplicación
```powershell
# Detener servicios
.\stop-vetclinic.ps1

# Actualizar código (si hay nueva versión)
git pull

# Reinstalar dependencias
pnpm install

# Compilar
pnpm build

# Iniciar servicios
.\start-vetclinic.ps1
```

---

## Notas

- El script de instalación crea automáticamente la base de datos y usuarios
- Los archivos de configuración se generan en `apps/api/.env` y `apps/web/.env.local`
- Los logs se guardan en la carpeta `logs/`
- Los backups se guardan en la carpeta `backups/`
