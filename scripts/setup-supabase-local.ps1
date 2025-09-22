# Configuración de Supabase Local para Sakú Store
# Ejecutar como: .\scripts\setup-supabase-local.ps1

param(
    [switch]$Start,
    [switch]$Stop,
    [switch]$Reset,
    [switch]$Status,
    [switch]$Help
)

function Show-Help {
    Write-Host "=== Configuración de Supabase Local - Sakú Store ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Uso:" -ForegroundColor Yellow
    Write-Host "  .\scripts\setup-supabase-local.ps1 -Start    # Iniciar Supabase local"
    Write-Host "  .\scripts\setup-supabase-local.ps1 -Stop     # Detener Supabase local"
    Write-Host "  .\scripts\setup-supabase-local.ps1 -Reset    # Resetear base de datos"
    Write-Host "  .\scripts\setup-supabase-local.ps1 -Status   # Ver estado actual"
    Write-Host "  .\scripts\setup-supabase-local.ps1 -Help     # Mostrar esta ayuda"
    Write-Host ""
    Write-Host "Requisitos:" -ForegroundColor Yellow
    Write-Host "  - Docker Desktop instalado y ejecutándose"
    Write-Host "  - Supabase CLI instalado (npm install -g supabase)"
    Write-Host ""
    Write-Host "Configuración inicial:" -ForegroundColor Yellow
    Write-Host "  1. Ejecutar: supabase init"
    Write-Host "  2. Ejecutar: .\scripts\setup-supabase-local.ps1 -Start"
    Write-Host "  3. Copiar las URLs que aparecen en .env.local"
    Write-Host ""
}

function Test-Prerequisites {
    Write-Host "Verificando requisitos..." -ForegroundColor Yellow
    
    # Verificar Docker
    try {
        $dockerStatus = docker version --format "{{.Server.Version}}" 2>$null
        if ($dockerStatus) {
            Write-Host "✓ Docker está disponible (v$dockerStatus)" -ForegroundColor Green
        } else {
            throw "Docker no está disponible"
        }
    } catch {
        Write-Host "✗ Docker no está disponible o no está ejecutándose" -ForegroundColor Red
        Write-Host "  Instala Docker Desktop y asegúrate de que esté ejecutándose" -ForegroundColor Yellow
        return $false
    }
    
    # Verificar Supabase CLI
    try {
        $supabaseVersion = supabase --version 2>$null
        if ($supabaseVersion) {
            Write-Host "✓ Supabase CLI está disponible ($supabaseVersion)" -ForegroundColor Green
        } else {
            throw "Supabase CLI no está disponible"
        }
    } catch {
        Write-Host "✗ Supabase CLI no está disponible" -ForegroundColor Red
        Write-Host "  Instala con: npm install -g supabase" -ForegroundColor Yellow
        return $false
    }
    
    return $true
}

function Start-SupabaseLocal {
    Write-Host "=== Iniciando Supabase Local ===" -ForegroundColor Cyan
    
    if (-not (Test-Prerequisites)) {
        return
    }
    
    # Verificar si ya está inicializado
    if (-not (Test-Path "supabase/config.toml")) {
        Write-Host "Inicializando proyecto Supabase..." -ForegroundColor Yellow
        supabase init
    }
    
    Write-Host "Iniciando servicios de Supabase..." -ForegroundColor Yellow
    supabase start
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=== Supabase Local Iniciado Exitosamente ===" -ForegroundColor Green
        Write-Host ""
        Write-Host "Próximos pasos:" -ForegroundColor Yellow
        Write-Host "1. Copia las URLs que aparecieron arriba a tu archivo .env.local"
        Write-Host "2. Ejecuta las migraciones: supabase db reset"
        Write-Host "3. Inicia el servidor de desarrollo: npm run dev"
        Write-Host ""
        Write-Host "URLs importantes:" -ForegroundColor Cyan
        Write-Host "- Studio: http://localhost:54323"
        Write-Host "- API: http://localhost:54321"
        Write-Host "- DB: postgresql://postgres:postgres@localhost:54322/postgres"
        Write-Host ""
    } else {
        Write-Host "Error al iniciar Supabase local" -ForegroundColor Red
    }
}

function Stop-SupabaseLocal {
    Write-Host "=== Deteniendo Supabase Local ===" -ForegroundColor Cyan
    
    supabase stop
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Supabase local detenido exitosamente" -ForegroundColor Green
    } else {
        Write-Host "Error al detener Supabase local" -ForegroundColor Red
    }
}

function Reset-SupabaseLocal {
    Write-Host "=== Reseteando Base de Datos Local ===" -ForegroundColor Cyan
    Write-Host "ADVERTENCIA: Esto eliminará todos los datos locales" -ForegroundColor Red
    
    $confirmation = Read-Host "¿Estás seguro? (y/N)"
    if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
        supabase db reset
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Base de datos reseteada exitosamente" -ForegroundColor Green
        } else {
            Write-Host "Error al resetear la base de datos" -ForegroundColor Red
        }
    } else {
        Write-Host "Operación cancelada" -ForegroundColor Yellow
    }
}

function Get-SupabaseStatus {
    Write-Host "=== Estado de Supabase Local ===" -ForegroundColor Cyan
    
    try {
        supabase status
    } catch {
        Write-Host "Supabase local no está ejecutándose o no está configurado" -ForegroundColor Yellow
    }
}

# Ejecutar función según parámetro
if ($Help -or (-not $Start -and -not $Stop -and -not $Reset -and -not $Status)) {
    Show-Help
} elseif ($Start) {
    Start-SupabaseLocal
} elseif ($Stop) {
    Stop-SupabaseLocal
} elseif ($Reset) {
    Reset-SupabaseLocal
} elseif ($Status) {
    Get-SupabaseStatus
}