#!/usr/bin/env node

/**
 * Script para configurar variables de entorno en Vercel
 * 
 * Uso:
 * 1. Instalar Vercel CLI: npm i -g vercel
 * 2. Hacer login: vercel login
 * 3. Ejecutar: node scripts/setup-vercel-env.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Leer variables del archivo .env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parsear variables de entorno
const envVars = {};
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#') && line.includes('=')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=');
    envVars[key] = value;
  }
});

// Variables críticas que deben estar en Vercel
const criticalVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE',
  'MP_ACCESS_TOKEN',
  'MP_PUBLIC_KEY',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_SECURE',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_SITE_URL'
];

console.log('🚀 Configurando variables de entorno en Vercel...\n');

// Función para ejecutar comandos de Vercel
function setVercelEnv(key, value, environment = 'production,preview,development') {
  try {
    const command = `vercel env add ${key} ${environment}`;
    console.log(`⚙️  Configurando ${key}...`);
    
    // Nota: Este comando requiere interacción manual para pegar el valor
    console.log(`   Comando: ${command}`);
    console.log(`   Valor: ${value}`);
    console.log('   ---');
    
    return true;
  } catch (error) {
    console.error(`❌ Error configurando ${key}:`, error.message);
    return false;
  }
}

// Generar comandos para las variables críticas
console.log('📋 Comandos para ejecutar en Vercel CLI:\n');

criticalVars.forEach(key => {
  if (envVars[key]) {
    console.log(`vercel env add ${key} production,preview,development`);
    console.log(`# Valor: ${envVars[key]}`);
    console.log('');
  } else {
    console.log(`# ⚠️  Variable ${key} no encontrada en .env`);
  }
});

console.log('\n📝 Instrucciones:');
console.log('1. Ejecuta cada comando "vercel env add" en tu terminal');
console.log('2. Cuando te pida el valor, copia y pega el valor indicado en el comentario');
console.log('3. Selecciona los entornos: production, preview, development');
console.log('\n🔗 También puedes configurar las variables desde la interfaz web:');
console.log('   https://vercel.com/dashboard → tu-proyecto → Settings → Environment Variables');

// Generar archivo de ejemplo para Vercel con valores de ejemplo seguros
const exampleValues = {
  'NEXT_PUBLIC_SUPABASE_URL': 'https://your-project-ref.supabase.co',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'your-anon-key-here',
  'SUPABASE_SERVICE_ROLE': 'your-service-role-key-here',
  'MP_ACCESS_TOKEN': 'your-mp-access-token-here',
  'MP_PUBLIC_KEY': 'your-mp-public-key-here',
  'SMTP_HOST': 'smtp-relay.brevo.com',
  'SMTP_PORT': '587',
  'SMTP_SECURE': 'false',
  'SMTP_USER': 'your-smtp-user@smtp-brevo.com',
  'SMTP_PASS': 'your-smtp-password-here',
  'SMTP_FROM': 'noreply@yourdomain.com',
  'NEXT_PUBLIC_APP_URL': 'https://your-domain.com',
  'NEXT_PUBLIC_SITE_URL': 'https://your-domain.com'
};

const vercelEnvExample = [
  '# Variables de entorno para Vercel',
  '# IMPORTANTE: Reemplaza estos valores de ejemplo con tus credenciales reales',
  '',
  '# Supabase',
  ...criticalVars.filter(key => key.includes('SUPABASE')).map(key => `${key}=${exampleValues[key] || 'your-value-here'}`),
  '',
  '# Mercado Pago',
  ...criticalVars.filter(key => key.includes('MP_')).map(key => `${key}=${exampleValues[key] || 'your-value-here'}`),
  '',
  '# SMTP (Brevo/Sendinblue)',
  ...criticalVars.filter(key => key.includes('SMTP')).map(key => `${key}=${exampleValues[key] || 'your-value-here'}`),
  '',
  '# URLs',
  ...criticalVars.filter(key => key.includes('URL')).map(key => `${key}=${exampleValues[key] || 'your-value-here'}`),
  '',
  '# Analytics',
  'GA4_ID=G-XXXXXXXXXX',
  'META_PIXEL_ID=your-pixel-id-here'
].join('\n');

fs.writeFileSync(
  path.join(__dirname, '..', 'vercel-env-example.txt'),
  vercelEnvExample
);

console.log('\n✅ Archivo vercel-env-example.txt generado con valores de ejemplo seguros');
console.log('⚠️  IMPORTANTE: Este archivo contiene valores de ejemplo, NO tus credenciales reales');