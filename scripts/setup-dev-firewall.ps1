# Script para configurar firewall de desarrollo - Solo puerto 3000 abierto
# Ejecutar como Administrador

param(
    [switch]$Enable,
    [switch]$Disable,
    [switch]$Status
)

$ErrorActionPreference = "Stop"

function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Enable-DevFirewall {
    Write-Host "🔒 Configurando firewall para desarrollo..." -ForegroundColor Yellow
    
    # Habilitar firewall
    netsh advfirewall set allprofiles state on
    
    # Bloquear todas las conexiones entrantes por defecto
    netsh advfirewall set allprofiles firewallpolicy blockinbound,allowoutbound
    
    # Eliminar reglas existentes de desarrollo
    netsh advfirewall firewall delete rule name="Saku Dev - Next.js" 2>$null
    netsh advfirewall firewall delete rule name="Saku Dev - Block All Inbound" 2>$null
    
    # Permitir solo puerto 3000 para Next.js
    netsh advfirewall firewall add rule name="Saku Dev - Next.js" dir=in action=allow protocol=TCP localport=3000
    
    # Bloquear explícitamente otros puertos comunes de desarrollo
    $blockedPorts = @(3001, 3002, 3003, 4000, 5000, 5173, 8000, 8080, 8081, 9000)
    foreach ($port in $blockedPorts) {
        netsh advfirewall firewall add rule name="Saku Dev - Block $port" dir=in action=block protocol=TCP localport=$port
    }
    
    Write-Host "✅ Firewall configurado - Solo puerto 3000 permitido" -ForegroundColor Green
}

function Disable-DevFirewall {
    Write-Host "🔓 Deshabilitando configuración de firewall de desarrollo..." -ForegroundColor Yellow
    
    # Eliminar reglas de desarrollo
    netsh advfirewall firewall delete rule name="Saku Dev - Next.js" 2>$null
    netsh advfirewall firewall delete rule name="Saku Dev - Block All Inbound" 2>$null
    
    $blockedPorts = @(3001, 3002, 3003, 4000, 5000, 5173, 8000, 8080, 8081, 9000)
    foreach ($port in $blockedPorts) {
        netsh advfirewall firewall delete rule name="Saku Dev - Block $port" 2>$null
    }
    
    # Restaurar configuración por defecto (más permisiva)
    netsh advfirewall set allprofiles firewallpolicy blockinbound,allowoutbound
    
    Write-Host "✅ Configuración de firewall de desarrollo eliminada" -ForegroundColor Green
}

function Show-FirewallStatus {
    Write-Host "🔍 Estado del firewall:" -ForegroundColor Cyan
    
    # Estado general del firewall
    $firewallStatus = netsh advfirewall show allprofiles state
    Write-Host $firewallStatus
    
    Write-Host "`n📋 Reglas de desarrollo activas:" -ForegroundColor Cyan
    
    # Mostrar reglas específicas de desarrollo
    $devRules = netsh advfirewall firewall show rule name="Saku Dev - Next.js" 2>$null
    if ($devRules) {
        Write-Host $devRules
    } else {
        Write-Host "❌ No hay reglas de desarrollo configuradas" -ForegroundColor Red
    }
    
    # Verificar si el puerto 3000 está permitido
    $port3000 = netsh advfirewall firewall show rule name="Saku Dev - Next.js" | Select-String "LocalPort.*3000"
    if ($port3000) {
        Write-Host "✅ Puerto 3000 permitido para desarrollo" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Puerto 3000 no configurado" -ForegroundColor Yellow
    }
}

# Verificar permisos de administrador
if (-not (Test-Administrator)) {
    Write-Host "❌ Este script requiere permisos de administrador" -ForegroundColor Red
    Write-Host "Ejecuta PowerShell como administrador y vuelve a intentar" -ForegroundColor Yellow
    exit 1
}

# Ejecutar acción según parámetros
if ($Enable) {
    Enable-DevFirewall
} elseif ($Disable) {
    Disable-DevFirewall
} elseif ($Status) {
    Show-FirewallStatus
} else {
    Write-Host "🔥 Configurador de Firewall para Desarrollo - Sakú Store" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "Uso:" -ForegroundColor White
    Write-Host "  .\setup-dev-firewall.ps1 -Enable   # Habilitar firewall de desarrollo"
    Write-Host "  .\setup-dev-firewall.ps1 -Disable  # Deshabilitar firewall de desarrollo"
    Write-Host "  .\setup-dev-firewall.ps1 -Status   # Ver estado actual"
    Write-Host ""
    Write-Host "⚠️  Ejecutar como Administrador" -ForegroundColor Yellow
}