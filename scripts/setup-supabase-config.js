#!/usr/bin/env node

/**
 * Script para configurar dinámicamente Supabase según el entorno
 * Detecta automáticamente si estamos en desarrollo o producción
 * y actualiza supabase/config.toml con las URLs correctas
 */

const fs = require('fs');
const path = require('path');

// Detectar entorno
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
const isPreview = process.env.VERCEL_ENV === 'preview';
const isDevelopment = !isProduction && !isPreview;

// URLs base según entorno
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Fallback para desarrollo
  return 'http://localhost:3000';
};

const baseUrl = getBaseUrl();
const environment = isProduction ? 'production' : isPreview ? 'preview' : 'development';

console.log(`��� Configurando Supabase para entorno: ${environment}`);
console.log(`��� URL base detectada: ${baseUrl}`);

// Leer configuración actual
const configPath = path.join(process.cwd(), 'supabase', 'config.toml');
let configContent = fs.readFileSync(configPath, 'utf8');

// URLs de redirección según entorno
const redirectUrls = isDevelopment 
  ? ['http://localhost:3000', 'https://localhost:3000']
  : [baseUrl];

// Actualizar configuración
configContent = configContent
  .replace(/site_url = ".*"/, `site_url = "${baseUrl}"`)
  .replace(/additional_redirect_urls = \[.*\]/, `additional_redirect_urls = ${JSON.stringify(redirectUrls)}`)
  .replace(/redirect_uri = ".*"/, isDevelopment 
    ? 'redirect_uri = "http://localhost:54321/auth/v1/callback"'
    : `redirect_uri = "${baseUrl}/auth/callback"`
  );

// Escribir configuración actualizada
fs.writeFileSync(configPath, configContent);

console.log('✅ Configuración de Supabase actualizada:');
console.log(`   - site_url: ${baseUrl}`);
console.log(`   - additional_redirect_urls: ${JSON.stringify(redirectUrls)}`);
console.log(`   - redirect_uri: ${isDevelopment ? 'http://localhost:54321/auth/v1/callback' : baseUrl + '/auth/callback'}`);

// Verificar que las variables de entorno necesarias estén presentes
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn('⚠️  Variables de entorno faltantes:');
  missingVars.forEach(varName => console.warn(`   - ${varName}`));
}

console.log('\n�� Próximos pasos:');
if (isDevelopment) {
  console.log('   1. Ejecutar: npx supabase start');
  console.log('   2. Verificar que la auth funcione en http://localhost:3000/auth/login');
} else {
  console.log('   1. Verificar configuración en Supabase Dashboard');
  console.log(`   2. Asegurar que ${baseUrl}/auth/callback esté en URLs permitidas`);
  console.log('   3. Probar autenticación en producción');
}
