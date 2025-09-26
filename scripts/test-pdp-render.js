#!/usr/bin/env node

/**
 * Script para probar el renderizado de la PDP
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando archivos de la PDP...\n');

// 1. Verificar que el archivo de la PDP existe
const pdpPath = path.join(__dirname, '..', 'src', 'app', 'productos', '[slug]', 'page.tsx');
if (!fs.existsSync(pdpPath)) {
  console.error('❌ Archivo PDP no encontrado:', pdpPath);
  process.exit(1);
}
console.log('✅ Archivo PDP encontrado');

// 2. Verificar que el hook existe
const hookPath = path.join(__dirname, '..', 'src', 'hooks', 'use-products.ts');
if (!fs.existsSync(hookPath)) {
  console.error('❌ Hook use-products no encontrado:', hookPath);
  process.exit(1);
}
console.log('✅ Hook use-products encontrado');

// 3. Verificar que las funciones de Supabase existen
const supabasePath = path.join(__dirname, '..', 'src', 'lib', 'supabase', 'products.ts');
if (!fs.existsSync(supabasePath)) {
  console.error('❌ Archivo Supabase products no encontrado:', supabasePath);
  process.exit(1);
}
console.log('✅ Archivo Supabase products encontrado');

// 4. Verificar sintaxis TypeScript
console.log('\n🔍 Verificando sintaxis TypeScript...');
try {
  execSync('npx tsc --noEmit --skipLibCheck', { 
    stdio: 'pipe',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ Sintaxis TypeScript correcta');
} catch (error) {
  console.error('❌ Error de sintaxis TypeScript:');
  console.error(error.stdout?.toString() || error.message);
}

// 5. Verificar ESLint
console.log('\n🔍 Verificando ESLint...');
try {
  execSync('npm run lint', { 
    stdio: 'pipe',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ ESLint sin errores');
} catch (error) {
  console.error('❌ Error de ESLint:');
  console.error(error.stdout?.toString() || error.message);
}

// 6. Verificar que el servidor está corriendo
console.log('\n🔍 Verificando servidor de desarrollo...');
try {
  const { execSync } = require('child_process');
  const result = execSync('netstat -ano | findstr :3000', { encoding: 'utf8' });
  if (result.includes(':3000')) {
    console.log('✅ Servidor corriendo en puerto 3000');
  } else {
    console.log('⚠️  Servidor no detectado en puerto 3000');
  }
} catch (error) {
  console.log('⚠️  No se pudo verificar el estado del servidor');
}

console.log('\n✅ Verificación completada');
console.log('\n📝 Recomendaciones:');
console.log('1. Abrir http://localhost:3000/productos/print en el navegador');
console.log('2. Abrir DevTools (F12) y revisar la consola');
console.log('3. Verificar la pestaña Network para errores de carga');
console.log('4. Revisar la pestaña Elements para verificar el DOM');