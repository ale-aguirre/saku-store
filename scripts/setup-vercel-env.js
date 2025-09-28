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

// Generar archivo de ejemplo para Vercel
const vercelEnvExample = criticalVars.map(key => {
  const value = envVars[key] || 'your-value-here';
  return `${key}=${value}`;
}).join('\n');

fs.writeFileSync(
  path.join(__dirname, '..', 'vercel-env-example.txt'),
  vercelEnvExample
);

console.log('\n✅ Archivo vercel-env-example.txt generado con las variables necesarias');