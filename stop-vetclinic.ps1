# VetClinic Pro - Script de Detención
# Detiene los servicios de VetClinic Pro

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VetClinic Pro - Deteniendo servicios" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Buscar procesos de Node.js relacionados con VetClinic
Write-Host "[1/1] Deteniendo servicios..." -ForegroundColor Yellow

$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    # También buscar procesos npm
    $npmProcesses = Get-Process -Name "npm" -ErrorAction SilentlyContinue
    
    # Detener procesos
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Stop-Process -Name "npm" -Force -ErrorAction SilentlyContinue
    
    Write-Host "  ✓ Procesos de Node.js detenidos" -ForegroundColor Green
} else {
    Write-Host "  ℹ No hay servicios de VetClinic en ejecución" -ForegroundColor Gray
}

# Verificar puertos
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$port4000 = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue

if (-not $port3000 -and -not $port4000) {
    Write-Host "  ✓ Puertos 3000 y 4000 libres" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Servicios detenidos" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
