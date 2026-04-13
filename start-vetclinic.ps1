# VetClinic Pro - Script de Inicio
# Este script inicia los servicios de VetClinic Pro

param(
    [switch]$SILENT
)

$ErrorActionPreference = "Stop"

if (-not $SILENT) {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  VetClinic Pro - Iniciando servicios" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
}

$projectRoot = $PSScriptRoot
$apiPath = Join-Path $projectRoot "apps\api"
$webPath = Join-Path $projectRoot "apps\web"
$logPath = Join-Path $projectRoot "logs"

# Crear directorio de logs
if (-not (Test-Path $logPath)) {
    New-Item -ItemType Directory -Path $logPath -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$apiLog = Join-Path $logPath "api_$timestamp.log"
$webLog = Join-Path $logPath "web_$timestamp.log"

# ============================================
# Detener servicios anteriores
# ============================================
if (-not $SILENT) {
    Write-Host "[1/2] Deteniendo servicios anteriores..." -ForegroundColor Yellow
}

$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    if (-not $SILENT) { Write-Host "  ✓ Procesos anteriores detenidos" -ForegroundColor Green }
} else {
    if (-not $SILENT) { Write-Host "  ℹ No hay procesos anteriores" -ForegroundColor Gray }
}

Start-Sleep -Seconds 2

# ============================================
# Verificar que hay build, si no, compilar
# ============================================
$apiDistPath = Join-Path $apiPath "dist"
$webDistPath = Join-Path $webPath ".next"

if (-not (Test-Path $apiDistPath)) {
    if (-not $SILENT) { Write-Host "  ⚠ Compilando API..." -ForegroundColor Yellow }
    Set-Location $apiPath
    npm run build | Out-Null
    Set-Location $projectRoot
}

if (-not (Test-Path $webDistPath)) {
    if (-not $SILENT) { Write-Host "  ⚠ Compilando Web..." -ForegroundColor Yellow }
    Set-Location $webPath
    npm run build | Out-Null
    Set-Location $projectRoot
}

# ============================================
# Iniciar Backend (siempre en background para auto-inicio)
# ============================================
if (-not $SILENT) {
    Write-Host "[2/2] Iniciando servicios..." -ForegroundColor Yellow
}

Set-Location $apiPath

# Usar start:prod para producción (background, no bloqueante)
$apiProcess = Start-Process -FilePath "npm" -ArgumentList "run", "start:prod" -NoNewWindow -PassThru -RedirectStandardOutput $apiLog
if (-not $SILENT) { Write-Host "  ✓ Backend iniciado (PID: $($apiProcess.Id))" -ForegroundColor Green }

Set-Location $webPath

# Usar start para producción (background, no bloqueante)
$webProcess = Start-Process -FilePath "npm" -ArgumentList "run", "start" -NoNewWindow -PassThru -RedirectStandardOutput $webLog
if (-not $SILENT) { Write-Host "  ✓ Frontend iniciado (PID: $($webProcess.Id))" -ForegroundColor Green }

Set-Location $projectRoot

if (-not $SILENT) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Servicios iniciados" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Accede a: http://localhost:3000" -ForegroundColor Green
    Write-Host ""
    
    # Obtener IP local
    $ipAddress = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi" -ErrorAction SilentlyContinue).IPAddress
    if (-not $ipAddress) {
        $ipAddress = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Ethernet" -ErrorAction SilentlyContinue).IPAddress
    }
    
    if ($ipAddress) {
        Write-Host "Desde red local: http://$ipAddress:3000" -ForegroundColor Cyan
    }
    Write-Host ""
}
