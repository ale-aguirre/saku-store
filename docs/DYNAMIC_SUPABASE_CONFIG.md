# Configuración Dinámica de Supabase

## Problema Resuelto

Anteriormente, las URLs de autenticación en `supabase/config.toml` estaban hardcodeadas para `localhost`, causando errores 404 en producción cuando los usuarios intentaban autenticarse.

## Solución Implementada

### Script Dinámico: `scripts/setup-supabase-config.js`

Este script detecta automáticamente el entorno y configura las URLs apropiadas:

- **Desarrollo**: `http://localhost:3000`
- **Preview (Vercel)**: `https://*.vercel.app`
- **Producción**: `https://saku-store.vercel.app`

### Configuraciones Actualizadas

El script modifica dinámicamente:

1. **`site_url`**: URL base para redirects y emails
2. **`additional_redirect_urls`**: URLs permitidas post-autenticación
3. **`redirect_uri`**: Callback específico para Google OAuth

### Uso

```bash
# Configuración automática (detecta entorno)
npm run supabase:config

# Configuración manual para producción
NEXT_PUBLIC_SITE_URL=https://saku-store.vercel.app NODE_ENV=production npm run supabase:config

# Configuración manual para preview
VERCEL_URL=preview-abc123.vercel.app npm run supabase:config
```

### Variables de Entorno Utilizadas

- `NEXT_PUBLIC_SITE_URL`: URL explícita (prioridad alta)
- `VERCEL_URL`: URL de preview de Vercel
- `NODE_ENV`: Detecta entorno (development/production)

### Flujo de Detección

1. Si existe `NEXT_PUBLIC_SITE_URL` → usar esa URL
2. Si existe `VERCEL_URL` → usar `https://${VERCEL_URL}`
3. Si `NODE_ENV=production` → usar `https://saku-store.vercel.app`
4. Por defecto → usar `http://localhost:3000`

### Integración con CI/CD

El script debe ejecutarse:

- **Desarrollo**: Automáticamente al hacer `npm run dev`
- **Preview**: En el build de Vercel con `VERCEL_URL`
- **Producción**: En el deploy con `NEXT_PUBLIC_SITE_URL`

### Próximos Pasos

1. Configurar URLs en Supabase Dashboard manualmente
2. Integrar script en pipeline de deploy
3. Verificar autenticación en todos los entornos

### Archivos Modificados

- `scripts/setup-supabase-config.js` (nuevo)
- `package.json` (script `supabase:config`)
- `supabase/config.toml` (actualizado dinámicamente)
