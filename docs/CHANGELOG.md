# Registro de Cambios - Sakú Lencería

> **Formato**: Basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)  
> **Versionado**: [Semantic Versioning](https://semver.org/lang/es/)

## [Sin versionar] - 2025-10-01

### Corregido
- **CRÍTICO**: Corregidas referencias incorrectas a tabla `users` que no existe
  - Restauradas referencias correctas a tabla `profiles` en 9 archivos
  - Eliminados errores `PGRST205` en middleware y componentes
  - Archivos afectados:
    - `src/app/auth/actions.ts`
    - `src/app/admin/page.tsx`
    - `src/app/api/debug/auth/route.ts`
    - `src/app/api/debug/test-queries/route.ts`
    - `src/middleware.ts`
    - `src/hooks/use-auth.tsx`
    - `src/components/admin/profile-photo-upload.tsx`
    - `src/app/admin/configuracion/page.tsx`
    - `src/components/admin/layout/AdminHeader.tsx`

### Agregado
- Documentación del esquema de base de datos (`docs/DATABASE_SCHEMA.md`)
- Registro detallado del error crítico en `docs/LEARNING_LOG.md`
- Este archivo de changelog (`docs/CHANGELOG.md`)

### Verificado
- ✅ Compilación TypeScript sin errores
- ✅ Servidor de desarrollo funcionando sin errores `PGRST205`
- ✅ Página `/admin/configuracion` funcional
- ✅ Panel de administración `/admin` funcional
- ✅ Flujo de autenticación completo

---

## Formato de Entradas

### Tipos de Cambios
- **Agregado** para nuevas funcionalidades
- **Cambiado** para cambios en funcionalidades existentes
- **Obsoleto** para funcionalidades que se eliminarán pronto
- **Eliminado** para funcionalidades eliminadas
- **Corregido** para corrección de errores
- **Seguridad** para vulnerabilidades

### Estructura de Entrada
```markdown
## [Versión] - YYYY-MM-DD

### Tipo de Cambio
- **Severidad** (CRÍTICO/MAYOR/MENOR): Descripción del cambio
  - Detalles adicionales si es necesario
  - Archivos afectados (si aplica)
  - Instrucciones de migración (si aplica)
```

### Niveles de Severidad
- **CRÍTICO**: Errores que rompen la aplicación o funcionalidad principal
- **MAYOR**: Cambios significativos en funcionalidad o arquitectura
- **MENOR**: Mejoras, optimizaciones o correcciones menores

---

**Nota**: Este changelog se mantiene manualmente. Cada cambio significativo debe documentarse aquí con fecha, descripción y archivos afectados.