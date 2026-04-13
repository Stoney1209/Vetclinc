# VetClinic Pro - Script de Backup
# Realiza backup de la base de datos PostgreSQL

param(
    [int]$KEEP_DAYS = 30
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VetClinic Pro - Backup de Base de Datos" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot
$backupDir = Join-Path $projectRoot "backups"

# Crear directorio de backups
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

# Configuración
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = Join-Path $backupDir "vetclinic_backup_$timestamp.sql"
$DB_PASSWORD = "VetClinic2024!"

Write-Host "[1/2] Generando backup..." -ForegroundColor Yellow

# Configurar entorno para PostgreSQL
$env:PGPASSWORD = $DB_PASSWORD

# Verificar que PostgreSQL esté ejecutándose
$pgService = Get-Service -Name postgresql* -ErrorAction SilentlyContinue
if (-not $pgService) {
    Write-Host "  ✗ PostgreSQL no está ejecutándose" -ForegroundColor Red
    exit 1
}

# Ejecutar pg_dump
& "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" -U postgres -h localhost -f $backupFile vetclinic 2>$null

if (Test-Path $backupFile) {
    $fileSize = (Get-Item $backupFile).Length / 1MB
    Write-Host "  ✓ Backup creado: $backupFile" -ForegroundColor Green
    Write-Host "  ✓ Tamaño: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "  ✗ Error al crear backup" -ForegroundColor Red
    exit 1
}

Write-Host "[2/2] Limpiando backups antiguos..." -ForegroundColor Yellow

# Eliminar backups mayores a KEEP_DAYS
$cutoffDate = (Get-Date).AddDays(-$KEEP_DAYS)
$oldBackups = Get-ChildItem -Path $backupDir -Filter "vetclinic_backup_*.sql" | Where-Object { $_.LastWriteTime -lt $cutoffDate }

if ($oldBackups) {
    $oldBackups | Remove-Item -Force
    Write-Host "  ✓ $($oldBackups.Count) backups antiguos eliminados" -ForegroundColor Green
} else {
    Write-Host "  ℹ No hay backups antiguos" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Backup completado" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Listar backups actuales
Write-Host "Backups disponibles:" -ForegroundColor White
Get-ChildItem -Path $backupDir -Filter "vetclinic_backup_*.sql" | Sort-Object LastWriteTime -Descending | ForEach-Object {
    $size = [math]::Round($_.Length / 1MB, 2)
    Write-Host "  $($_.Name) - $size MB - $($_.LastWriteTime.ToString('yyyy-MM-dd HH:mm'))" -ForegroundColor Gray
}
Write-Host ""
