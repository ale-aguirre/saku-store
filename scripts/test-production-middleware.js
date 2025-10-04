#!/usr/bin/env node

/**
 * Script para diagnosticar problemas del middleware en producción
 * Verifica si las variables de entorno están disponibles y si el middleware funciona correctamente
 */

const https = require('https');

const PRODUCTION_URL = 'https://saku-store-hqi1gpinm-alexis-aguirres-projects.vercel.app';

async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = `${PRODUCTION_URL}${path}`;
    console.log(`\n🔍 Testing: ${url}`);
    
    const req = https.request(url, {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          url: url
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

async function testMiddleware() {
  console.log('🚀 Iniciando diagnóstico del middleware en producción...\n');
  
  const tests = [
    {
      name: 'Página principal (sin auth)',
      path: '/',
      expectedStatus: [200, 302]
    },
    {
      name: 'API de debug/env (debería funcionar)',
      path: '/api/debug/env',
      expectedStatus: [200]
    },
    {
      name: 'API de health (debería funcionar)',
      path: '/api/health',
      expectedStatus: [200]
    },
    {
      name: 'Página de login (sin auth)',
      path: '/auth/login',
      expectedStatus: [200]
    },
    {
      name: 'Admin (debería redirigir a login)',
      path: '/admin',
      expectedStatus: [302, 307]
    },
    {
      name: 'Cuenta (debería redirigir a login)',
      path: '/cuenta',
      expectedStatus: [302, 307]
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await makeRequest(test.path);
      const success = test.expectedStatus.includes(result.status);
      
      console.log(`${success ? '✅' : '❌'} ${test.name}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Expected: ${test.expectedStatus.join(' or ')}`);
      
      if (result.headers.location) {
        console.log(`   Redirect: ${result.headers.location}`);
      }
      
      // Si es una respuesta de error, mostrar parte del contenido
      if (!success && result.data) {
        const preview = result.data.substring(0, 200).replace(/\n/g, ' ');
        console.log(`   Content preview: ${preview}...`);
      }
      
      results.push({
        ...test,
        status: result.status,
        success: success,
        headers: result.headers,
        data: result.data
      });
      
    } catch (error) {
      console.log(`❌ ${test.name}`);
      console.log(`   Error: ${error.message}`);
      
      results.push({
        ...test,
        error: error.message,
        success: false
      });
    }
    
    // Pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Resumen
  console.log('\n📊 RESUMEN:');
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Exitosos: ${successful}/${total}`);
  console.log(`❌ Fallidos: ${total - successful}/${total}`);
  
  // Análisis específico
  console.log('\n🔍 ANÁLISIS:');
  
  const apiDebugResult = results.find(r => r.path === '/api/debug/env');
  if (apiDebugResult && apiDebugResult.success) {
    console.log('✅ API de debug funciona - las variables de entorno están disponibles en las APIs');
  } else {
    console.log('❌ API de debug falla - problema con variables de entorno o configuración');
  }
  
  const homeResult = results.find(r => r.path === '/');
  if (homeResult && homeResult.status === 401) {
    console.log('❌ Página principal devuelve 401 - middleware está bloqueando todo');
    console.log('   Esto sugiere que las variables de entorno no están disponibles en el middleware');
  } else if (homeResult && homeResult.success) {
    console.log('✅ Página principal funciona correctamente');
  }
  
  const adminResult = results.find(r => r.path === '/admin');
  if (adminResult && [302, 307].includes(adminResult.status)) {
    console.log('✅ Admin redirige correctamente (middleware funciona)');
  } else if (adminResult && adminResult.status === 401) {
    console.log('❌ Admin devuelve 401 en lugar de redirigir');
  }
  
  console.log('\n💡 RECOMENDACIONES:');
  if (homeResult && homeResult.status === 401) {
    console.log('1. Verificar que las variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY estén configuradas en Vercel');
    console.log('2. Verificar que el middleware tenga acceso a las variables de entorno');
    console.log('3. Considerar temporalmente deshabilitar el middleware para verificar que las APIs funcionen');
  }
  
  return results;
}

// Ejecutar el test
testMiddleware().catch(console.error);