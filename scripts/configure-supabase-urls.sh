#!/bin/bash

# Script para configurar URLs de autenticación en Supabase usando Management API
# Requiere SUPABASE_ACCESS_TOKEN en variables de entorno

PROJECT_REF="yhddnpcwhmeupwsjkchb"
SITE_URL="https://saku-store.vercel.app"

# URLs de redirección incluyendo sakulenceria.com
REDIRECT_URLS='[
  "https://saku-store.vercel.app",
  "https://saku-store.vercel.app/auth/callback",
  "https://sakulenceria.com",
  "https://sakulenceria.com/auth/callback",
  "https://www.sakulenceria.com",
  "https://www.sakulenceria.com/auth/callback"
]'

echo "� Configurando URLs de autenticación en Supabase..."
echo "� Proyecto: $PROJECT_REF"
echo "� Site URL: $SITE_URL"
echo "� Redirect URLs:"
echo "$REDIRECT_URLS" | jq -r '.[]' | sed 's/^/   - /'

# Verificar que tenemos el access token
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "❌ Error: SUPABASE_ACCESS_TOKEN no encontrado"
  echo "� Para obtenerlo:"
  echo "   1. Ve a https://supabase.com/dashboard/account/tokens"
  echo "   2. Crea un nuevo token"
  echo "   3. Exporta: export SUPABASE_ACCESS_TOKEN=tu_token"
  exit 1
fi

echo ""
echo "� Aplicando configuración..."

# Configurar Site URL
echo "� Configurando Site URL..."
curl -X PATCH \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"SITE_URL\": \"$SITE_URL\",
    \"URI_ALLOW_LIST\": \"$SITE_URL,https://sakulenceria.com,https://www.sakulenceria.com,https://saku-store.vercel.app/auth/callback,https://sakulenceria.com/auth/callback,https://www.sakulenceria.com/auth/callback\"
  }"

echo ""
echo "✅ Configuración aplicada!"
echo ""
echo "� Resumen de URLs configuradas:"
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
echo "⚠️  Recuerda también configurar en Google OAuth Console:"
echo "   - https://saku-store.vercel.app/auth/callback"
echo "   - https://sakulenceria.com/auth/callback"
