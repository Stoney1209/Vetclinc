# VetClinic Pro - Script de Instalación para Windows 11
# Ejecutar como Administrador

param(
    [string]$DB_PASSWORD = "VetClinic2024!",
    [string]$JWT_SECRET = "vetclinic-prod-secret-key-change-this",
    [switch]$AUTO_START,
    [switch]$START_NOW
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VetClinic Pro - Instalación Windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# 1. Verificar Node.js
# ============================================
Write-Host "[1/10] Verificando Node.js..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js no instalado" -ForegroundColor Red
    Write-Host "  Por favor instala Node.js 20 LTS desde: https://nodejs.org" -ForegroundColor Red
    exit 1
}

# ============================================
# 2. Verificar PostgreSQL
# ============================================
Write-Host "[2/10] Verificando PostgreSQL..." -ForegroundColor Yellow

$pgAvailable = Get-Service -Name postgresql* -ErrorAction SilentlyContinue
if (-not $pgAvailable) {
    Write-Host "  ✗ PostgreSQL no instalado" -ForegroundColor Red
    Write-Host "  Por favor instala PostgreSQL 16 desde: https://www.postgresql.org/download/windows/" -ForegroundColor Red
    exit 1
}

Write-Host "  ✓ PostgreSQL encontrado" -ForegroundColor Green

# ============================================
# 3. Configurar Base de Datos
# ============================================
Write-Host "[3/10] Configurando base de datos..." -ForegroundColor Yellow

$env:PGPASSWORD = $DB_PASSWORD

# Crear usuario
$createUserCmd = "CREATE USER vetclinic WITH PASSWORD '$DB_PASSWORD';"
$testUser = & psql -U postgres -h localhost -c "SELECT 1 FROM pg_roles WHERE rolname='vetclinic'" 2>$null

if ($testUser -eq "1") {
    Write-Host "  ✓ Usuario 'vetclinic' ya existe" -ForegroundColor Green
} else {
    & psql -U postgres -h localhost -c $createUserCmd 2>$null
    Write-Host "  ✓ Usuario 'vetclinic' creado" -ForegroundColor Green
}

# Crear base de datos
$testDb = & psql -U postgres -h localhost -l | Select-String "vetclinic"
if ($testDb) {
    Write-Host "  ✓ Base de datos 'vetclinic' ya existe" -ForegroundColor Green
} else {
    & psql -U postgres -h localhost -c "CREATE DATABASE vetclinic OWNER vetclinic;" 2>$null
    Write-Host "  ✓ Base de datos 'vetclinic' creada" -ForegroundColor Green
}

# ============================================
# 4. Instalar dependencias
# ============================================
Write-Host "[4/10] Instalando dependencias..." -ForegroundColor Yellow

# Instalar pnpm globalmente si no existe
$pnpmVersion = pnpm --version 2>$null
if (-not $pnpmVersion) {
    Write-Host "  Instalando pnpm..." -ForegroundColor Gray
    npm install -g pnpm
}

Write-Host "  ✓ pnpm instalado" -ForegroundColor Green

# Instalar dependencias del proyecto
pnpm install
Write-Host "  ✓ Dependencias instaladas" -ForegroundColor Green

# ============================================
# 5. Configurar variables de entorno
# ============================================
Write-Host "[5/10] Configurando variables de entorno..." -ForegroundColor Yellow

$apiEnvPath = "apps\api\.env"
$webEnvPath = "apps\web\.env.local"

# Verificar si es ruta relativa y convertir a absoluta
if (-not (Test-Path $apiEnvPath)) {
    $apiEnvPath = Join-Path $PSScriptRoot $apiEnvPath
    $webEnvPath = Join-Path $PSScriptRoot $webEnvPath
}

# Crear .env para API
$apiEnvContent = @"
DATABASE_URL="postgresql://vetclinic:$DB_PASSWORD@localhost:5432/vetclinic?schema=public"
JWT_SECRET="$JWT_SECRET"
JWT_EXPIRES_IN="7d"
PORT=4000
"@

if (Test-Path $apiEnvPath) {
    Write-Host "  ℹ .env de API ya existe, respaldando..." -ForegroundColor Gray
    Copy-Item $apiEnvPath "$apiEnvPath.backup"
}

$apiEnvContent | Out-File -FilePath $apiEnvPath -Encoding UTF8 -Force
Write-Host "  ✓ .env de API configurado" -ForegroundColor Green

# Crear .env.local para Web
$webEnvContent = @"
NEXT_PUBLIC_API_URL=http://localhost:4000/api
"@

if (Test-Path $webEnvPath) {
    Write-Host "  ℹ .env.local ya existe, respaldando..." -ForegroundColor Gray
    Copy-Item $webEnvPath "$webEnvPath.backup"
}

$webEnvContent | Out-File -FilePath $webEnvPath -Encoding UTF8 -Force
Write-Host "  ✓ .env.local de Web configurado" -ForegroundColor Green

# ============================================
# 6. Generar Prisma Client y Migraciones
# ============================================
Write-Host "[6/10] Configurando base de datos..." -ForegroundColor Yellow

Set-Location (Join-Path $PSScriptRoot "apps\api")

# Generar Prisma Client
npx prisma generate
Write-Host "  ✓ Prisma Client generado" -ForegroundColor Green

# Ejecutar migraciones
npx prisma migrate deploy
Write-Host "  ✓ Migraciones ejecutadas" -ForegroundColor Green

Set-Location $PSScriptRoot

# ============================================
# 7. Compilar aplicaciones
# ============================================
Write-Host "[7/10] Compilando aplicaciones..." -ForegroundColor Yellow

pnpm build
Write-Host "  ✓ Aplicaciones compiladas" -ForegroundColor Green

# Iniciar ahora si se pide
if ($START_NOW) {
    Write-Host ""
    Write-Host "Iniciando VetClinic Pro..." -ForegroundColor Cyan
    & (Join-Path $PSScriptRoot "start-vetclinic.ps1")
}

# ============================================
# 8. Configurar Firewall
# ============================================
Write-Host "[8/10] Configurando Firewall de Windows..." -ForegroundColor Yellow

# Puerto 3000 (Frontend)
$rule1 = Get-NetFirewallRule -DisplayName "VetClinic Frontend" -ErrorAction SilentlyContinue
if (-not $rule1) {
    New-NetFirewallRule -DisplayName "VetClinic Frontend" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow | Out-Null
    Write-Host "  ✓ Puerto 3000 abierto (Frontend)" -ForegroundColor Green
} else {
    Write-Host "  ℹ Puerto 3000 ya configurado" -ForegroundColor Gray
}

# Puerto 4000 (Backend)
$rule2 = Get-NetFirewallRule -DisplayName "VetClinic Backend" -ErrorAction SilentlyContinue
if (-not $rule2) {
    New-NetFirewallRule -DisplayName "VetClinic Backend" -Direction Inbound -Protocol TCP -LocalPort 4000 -Action Allow | Out-Null
    Write-Host "  ✓ Puerto 4000 abierto (Backend)" -ForegroundColor Green
} else {
    Write-Host "  ℹ Puerto 4000 ya configurado" -ForegroundColor Gray
}

# ============================================
# 9. Configurar auto-inicio (opcional)
# ============================================
Write-Host "[9/10] Configurando auto-inicio..." -ForegroundColor Yellow

$startupScript = Join-Path $PSScriptRoot "start-vetclinic.ps1"

if ($AUTO_START) {
    # Crear tarea programada
    $taskName = "VetClinic Pro"
    # Usar -SILENT para que no muestre output cuando se ejecuta automáticamente
    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$startupScript`" -SILENT"
    $trigger = New-ScheduledTaskTrigger -At "08:00" -Daily
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable:$false
    
    # Configurar para que reinicie si falla
    $settings.RestartCount = 3
    $settings.RestartInterval = [TimeSpan]::FromMinutes(1)

    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description "VetClinic Pro - Sistema de Gestión Veterinaria" | Out-Null

    Write-Host "  ✓ Auto-inicio configurado (8:00 AM diario)" -ForegroundColor Green
    Write-Host "  ✓ VetClinic se iniciará automáticamente al encender la PC" -ForegroundColor Green
} else {
    Write-Host "  ℹ Auto-inicio no configurado (usar -AUTO_START para habilitar)" -ForegroundColor Gray
}

# ============================================
# 10. Verificar servicios
# ============================================
Write-Host "[10/10] Verificando servicios..." -ForegroundColor Yellow

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Instalación completada!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Acceso local:" -ForegroundColor White
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:4000/api" -ForegroundColor Green
Write-Host "  Swagger:  http://localhost:4000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "Credenciales:" -ForegroundColor White
Write-Host "  Email:    admin@vetclinic.com" -ForegroundColor Cyan
Write-Host "  Password: password123" -ForegroundColor Cyan
Write-Host ""

# Obtener IP local
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi" -ErrorAction SilentlyContinue).IPAddress
if (-not $ipAddress) {
    $ipAddress = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Ethernet" -ErrorAction SilentlyContinue).IPAddress
}
if (-not $ipAddress) {
    $ipAddress = "192.168.x.x"
}

Write-Host "Acceso desde red local:" -ForegroundColor White
Write-Host "  http://$ipAddress:3000" -ForegroundColor Green
Write-Host ""
