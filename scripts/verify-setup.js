#!/usr/bin/env node

/**
 * Script de verificación para Sakú Store
 * Verifica que la configuración esté correcta y los datos mock funcionen
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de Sakú Store...\n');

// Verificar archivo .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ Archivo .env.local encontrado');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE'
  ];
  
  const missingVars = requiredVars.filter(varName => !envContent.includes(varName));
  
  if (missingVars.length === 0) {
    console.log('✅ Variables de entorno requeridas presentes');
  } else {
    console.log('❌ Variables de entorno faltantes:', missingVars.join(', '));
  }
} else {
  console.log('❌ Archivo .env.local no encontrado');
}

// Verificar datos mock
const mockDataPath = path.join(process.cwd(), 'src/lib/mock-data.ts');
if (fs.existsSync(mockDataPath)) {
  console.log('✅ Archivo de datos mock encontrado');
  
  const mockContent = fs.readFileSync(mockDataPath, 'utf8');
  
  // Verificar que tenga productos
  if (mockContent.includes('mockProducts') && mockContent.includes('product_variants')) {
    console.log('✅ Datos mock de productos configurados');
  } else {
    console.log('❌ Datos mock de productos incompletos');
  }
  
  // Verificar que tenga cupones
  if (mockContent.includes('mockCoupons')) {
    console.log('✅ Datos mock de cupones configurados');
  } else {
    console.log('❌ Datos mock de cupones faltantes');
  }
} else {
  console.log('❌ Archivo de datos mock no encontrado');
}

// Verificar hooks
const hooksPath = path.join(process.cwd(), 'src/hooks/use-products.ts');
if (fs.existsSync(hooksPath)) {
  console.log('✅ Hook use-products encontrado');
  
  const hooksContent = fs.readFileSync(hooksPath, 'utf8');
  
  if (hooksContent.includes('useProduct') && hooksContent.includes('useProducts')) {
    console.log('✅ Funciones useProduct y useProducts definidas');
  } else {
    console.log('❌ Funciones de productos incompletas');
  }
  
  if (hooksContent.includes('mockProducts')) {
    console.log('✅ Fallback a datos mock configurado');
  } else {
    console.log('❌ Fallback a datos mock no configurado');
  }
} else {
  console.log('❌ Hook use-products no encontrado');
}

// Verificar páginas principales
const pages = [
  'src/app/page.tsx',
  'src/app/productos/page.tsx',
  'src/app/productos/[id]/page.tsx'
];

pages.forEach(pagePath => {
  const fullPath = path.join(process.cwd(), pagePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ Página ${pagePath} encontrada`);
  } else {
    console.log(`❌ Página ${pagePath} no encontrada`);
  }
});

// Verificar componentes principales
const components = [
  'src/components/ui/button.tsx',
  'src/components/cart/cart-drawer.tsx'
];

components.forEach(componentPath => {
  const fullPath = path.join(process.cwd(), componentPath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ Componente ${componentPath} encontrado`);
  } else {
    console.log(`❌ Componente ${componentPath} no encontrado`);
  }
});

// Verificar package.json
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  console.log('✅ package.json encontrado');
  
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const requiredDeps = [
    'next',
    'react',
    '@supabase/supabase-js',
    '@tanstack/react-query',
    'zod',
    'react-hook-form'
  ];
  
  const missingDeps = requiredDeps.filter(dep => 
    !packageContent.dependencies?.[dep] && !packageContent.devDependencies?.[dep]
  );
  
  if (missingDeps.length === 0) {
    console.log('✅ Dependencias principales instaladas');
  } else {
    console.log('❌ Dependencias faltantes:', missingDeps.join(', '));
  }
} else {
  console.log('❌ package.json no encontrado');
}

console.log('\n🎯 Verificación completada');
console.log('\n📋 Próximos pasos:');
console.log('1. Si hay errores, corregir los archivos faltantes');
console.log('2. Ejecutar: npm run dev');
console.log('3. Probar la página: http://localhost:3000/productos/1');
console.log('4. Ejecutar tests: npm run test:e2e');
console.log('\n💡 Para configurar Supabase real:');
console.log('1. Crear proyecto en Supabase');
console.log('2. Ejecutar: scripts/setup-supabase.sql');
console.log('3. Actualizar variables en .env.local');