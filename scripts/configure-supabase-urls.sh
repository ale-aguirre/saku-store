#!/bin/bash

# Script para configurar URLs de autenticaci√≥n en Supabase usando Management API
# Requiere SUPABASE_ACCESS_TOKEN en variables de entorno

PROJECT_REF="yhddnpcwhmeupwsjkchb"
SITE_URL="https://saku-store.vercel.app"

# URLs de redirecci√≥n incluyendo sakulenceria.com
REDIRECT_URLS='[
  "https://saku-store.vercel.app",
  "https://saku-store.vercel.app/auth/callback",
  "https://sakulenceria.com",
  "https://sakulenceria.com/auth/callback",
  "https://www.sakulenceria.com",
  "https://www.sakulenceria.com/auth/callback"
]'

echo "Ì¥ß Configurando URLs de autenticaci√≥n en Supabase..."
echo "Ì≥ã Proyecto: $PROJECT_REF"
echo "Ìºê Site URL: $SITE_URL"
echo "Ì¥ó Redirect URLs:"
echo "$REDIRECT_URLS" | jq -r '.[]' | sed 's/^/   - /'

# Verificar que tenemos el access token
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "‚ùå Error: SUPABASE_ACCESS_TOKEN no encontrado"
  echo "Ì≤° Para obtenerlo:"
  echo "   1. Ve a https://supabase.com/dashboard/account/tokens"
  echo "   2. Crea un nuevo token"
  echo "   3. Exporta: export SUPABASE_ACCESS_TOKEN=tu_token"
  exit 1
fi

echo ""
echo "Ì∫Ä Aplicando configuraci√≥n..."

# Configurar Site URL
echo "Ì≥ù Configurando Site URL..."
curl -X PATCH \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"SITE_URL\": \"$SITE_URL\",
    \"URI_ALLOW_LIST\": \"$SITE_URL,https://sakulenceria.com,https://www.sakulenceria.com,https://saku-store.vercel.app/auth/callback,https://sakulenceria.com/auth/callback,https://www.sakulenceria.com/auth/callback\"
  }"

echo ""
echo "‚úÖ Configuraci√≥n aplicada!"
echo ""
echo "Ì≥ã Resumen de URLs configuradas:"
echo "   Site URL: $SITE_URL"
echo "   Dominios permitidos:"
echo "     - https://saku-store.vercel.app"
echo "     - https://sakulenceria.com"
echo "     - https://www.sakulenceria.com"
echo "   Callbacks:"
echo "     - https://saku-store.vercel.app/auth/callback"
echo "     - https://sakulenceria.com/auth/callback"
echo "     - https://www.sakulenceria.com/auth/callback"
echo ""
echo "‚ö†Ô∏è  Recuerda tambi√©n configurar en Google OAuth Console:"
echo "   - https://saku-store.vercel.app/auth/callback"
echo "   - https://sakulenceria.com/auth/callback"
