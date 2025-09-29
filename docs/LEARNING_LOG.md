# Learning Log - Sakú Lencería

## 2025-09-29 14:30 - Dependencias faltantes en librerías externas

**Issue**: Error de compilación por dependencia faltante (`axios`) en librería `ylazzari-correoargentino`.

**Cause**: La librería externa requiere `axios` pero no lo declara como dependencia directa, solo como peer dependency.

**Fix**: Instalación manual de `axios` con `--legacy-peer-deps` para resolver conflictos de versiones de `dotenv`.

**Prevention**: 
- Verificar dependencias de librerías externas antes de integrarlas
- Revisar peer dependencies y conflictos potenciales
- Documentar dependencias adicionales requeridas en el README

## 2025-09-29 14:30 - Componentes inexistentes en imports

**Issue**: Error de TypeScript por importación de componente `OrderSummary` que no existe.

**Cause**: El componente fue eliminado en refactoring previo pero las importaciones no fueron actualizadas.

**Fix**: Eliminación de import y reemplazo con componente `Card` simple.

**Prevention**:
- Verificar existencia de archivos antes de importar
- Usar herramientas de refactoring automático cuando sea posible
- Mantener consistencia entre eliminaciones y referencias
