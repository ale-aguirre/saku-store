#!/usr/bin/env node

/**
 * Script para verificar el estado del despliegue en Vercel
 * Uso: node scripts/check-vercel-deployment.js [url]
 */

const https = require('https');
const http = require('http');

const DEFAULT_URL = 'https://saku-store.vercel.app';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 500) // Solo los primeros 500 caracteres
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
  });
}

async function checkDeployment() {
  const url = process.argv[2] || DEFAULT_URL;
  
  console.log(`🔍 Verificando despliegue en: ${url}`);
  console.log('⏳ Realizando request...\n');
  
  try {
    const result = await makeRequest(url);
    
    console.log('✅ Respuesta recibida:');
    console.log(`   Status: ${result.statusCode}`);
    console.log(`   Content-Type: ${result.headers['content-type']}`);
    console.log(`   X-Powered-By: ${result.headers['x-powered-by'] || 'N/A'}`);
    console.log(`   Cache-Control: ${result.headers['cache-control'] || 'N/A'}`);
    
    if (result.statusCode === 200) {
      console.log('\n🎉 El sitio está funcionando correctamente');
      
      // Verificar si contiene contenido HTML válido
      if (result.data.includes('<html') && result.data.includes('</html>')) {
        console.log('✅ Contenido HTML válido detectado');
      } else {
        console.log('⚠️  El contenido no parece ser HTML válido');
        console.log('Primeros 200 caracteres:', result.data.substring(0, 200));
      }
    } else {
      console.log(`\n❌ Error: Status ${result.statusCode}`);
      console.log('Contenido:', result.data.substring(0, 200));
    }
    
  } catch (error) {
    console.log('❌ Error al verificar el despliegue:');
    console.log(`   ${error.message}`);
    
    if (error.code === 'ENOTFOUND') {
      console.log('   El dominio no se pudo resolver');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('   Conexión rechazada');
    }
  }
}

// Verificar también el endpoint de diagnóstico
async function checkDiagnostics() {
  const baseUrl = process.argv[2] || DEFAULT_URL;
  const diagnosticsUrl = `${baseUrl}/api/debug/env`;
  
  console.log(`\n🔍 Verificando endpoint de diagnóstico: ${diagnosticsUrl}`);
  
  try {
    const result = await makeRequest(diagnosticsUrl);
    
    if (result.statusCode === 200) {
      console.log('✅ Endpoint de diagnóstico funcionando');
      try {
        const data = JSON.parse(result.data);
        console.log('📊 Información del entorno:');
        console.log(`   Environment: ${data.environment}`);
        console.log(`   Supabase URL: ${data.supabase?.url}`);
        console.log(`   Supabase Connection: ${data.supabase?.connection}`);
        console.log(`   Mercado Pago: ${data.mercadoPago?.accessToken}`);
      } catch (e) {
        console.log('⚠️  Respuesta no es JSON válido');
      }
    } else {
      console.log(`❌ Error en diagnóstico: Status ${result.statusCode}`);
    }
  } catch (error) {
    console.log(`❌ Error al verificar diagnóstico: ${error.message}`);
  }
}

async function main() {
  await checkDeployment();
  await checkDiagnostics();
}

main().catch(console.error);