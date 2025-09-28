# Supabase Configuration

Este directorio contiene la configuración de Supabase para el proyecto Sakú Lencería.

## Estructura

- `/migrations/` - Migraciones de base de datos
- `/config.toml` - Configuración de Supabase CLI
- `/.temp/` - Archivos temporales del CLI

## Plantillas de Email

⚠️ **IMPORTANTE**: Las plantillas de email han sido migradas a `/email/`

Las plantillas que anteriormente estaban en `/supabase/templates/` ahora se encuentran en:
- **Nueva ubicación**: `/email/templates/`
- **Formato**: MJML con compilación a HTML
- **Gestión**: Scripts npm para build, preview y validación

Para más información sobre las plantillas de email, consultar `/email/README.md`.