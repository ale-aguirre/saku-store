#!/usr/bin/env node

/**
 * Script completo para probar la autenticación en producción
 * Usa el dominio principal de Vercel (sin Deployment Protection)
 */

const https = require('https');

const PRODUCTION_URL = 'https://saku-store.vercel.app';

async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, PRODUCTION_URL);
    
    const requestOptions = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          redirectLocation: res.headers.location
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

async function testEndpoint(name, path, expectedStatus, description) {
  try {
    console.log(`🔍 Testing: ${PRODUCTION_URL}${path}`);
    const response = await makeRequest(path);
    
    const success = Array.isArray(expectedStatus) 
      ? expectedStatus.includes(response.statusCode)
      : response.statusCode === expectedStatus;
    
    if (success) {
      console.log(`✅ ${name}`);
      console.log(`   Status: ${response.statusCode}`);
      if (response.redirectLocation) {
        console.log(`   Redirect: ${response.redirectLocation}`);
      }
      if (response.headers['x-middleware-debug']) {
        console.log(`   Middleware: ${response.headers['x-middleware-debug']}`);
      }
      if (response.headers['x-supabase-config']) {
        console.log(`   Supabase: ${response.headers['x-supabase-config']}`);
      }
    } else {
      console.log(`❌ ${name}`);
      console.log(`   Status: ${response.statusCode}`);
      console.log(`   Expected: ${Array.isArray(expectedStatus) ? expectedStatus.join(' or ') : expectedStatus}`);
      console.log(`   Content preview: ${response.body.substring(0, 100).replace(/\n/g, '\\n')}...`);
    }
    
    return success;
  } catch (error) {
    console.log(`❌ ${name} - Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Iniciando pruebas de autenticación en producción');
  console.log(`📍 URL base: ${PRODUCTION_URL}`);
  console.log('');

  const tests = [
    {
      name: 'API de test simple',
      path: '/api/test-simple',
      expectedStatus: 200,
      description: 'Verifica que las APIs funcionen y tengan acceso a variables de entorno'
    },
    {
      name: 'Página principal (sin auth)',
      path: '/',
      expectedStatus: 200,
      description: 'Debe cargar sin problemas'
    },
    {
      name: 'API de debug/env',
      path: '/api/debug/env',
      expectedStatus: 200,
      description: 'Debe mostrar info de variables de entorno'
    },
    {
      name: 'API de health',
      path: '/api/health',
      expectedStatus: 200,
      description: 'Debe responder OK'
    },
    {
      name: 'Página de login (sin auth)',
      path: '/auth/login',
      expectedStatus: 200,
      description: 'Debe cargar el formulario de login'
    },
    {
      name: 'Admin (debería redirigir a login)',
      path: '/admin',
      expectedStatus: [302, 307],
      description: 'Debe redirigir a login por falta de autenticación'
    },
    {
      name: 'Cuenta (debería redirigir a login)',
      path: '/cuenta',
      expectedStatus: [302, 307],
      description: 'Debe redirigir a login por falta de autenticación'
    }
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    const success = await testEndpoint(test.name, test.path, test.expectedStatus, test.description);
    if (success) passed++;
    console.log('');
  }

  console.log('📊 RESUMEN:');
  console.log(`✅ Exitosos: ${passed}/${total}`);
  console.log(`❌ Fallidos: ${total - passed}/${total}`);
  console.log('');

  if (passed === total) {
    console.log('🎉 ¡Todas las pruebas pasaron! La autenticación funciona correctamente en producción.');
  } else {
    console.log('⚠️  ANÁLISIS:');
    if (passed === 0) {
      console.log('❌ Ninguna prueba pasó - problema fundamental con el deployment');
    } else if (passed < total / 2) {
      console.log('❌ Mayoría de pruebas fallan - revisar configuración de middleware/auth');
    } else {
      console.log('⚠️  Algunas pruebas fallan - revisar casos específicos');
    }
    
    console.log('');
    console.log('🔧 RECOMENDACIONES:');
    console.log('1. Verificar que las variables de entorno estén configuradas en Vercel');
    console.log('2. Revisar logs de Vercel para errores específicos');
    console.log('3. Verificar que el middleware tenga acceso a las variables de entorno');
    console.log('4. Probar manualmente en el navegador para verificar comportamiento');
  }
}

runTests().catch(console.error);