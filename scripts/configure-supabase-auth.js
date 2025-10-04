#!/usr/bin/env node

/**
 * Script para configurar URLs de autenticación en Supabase Dashboard
 * Configura Site URL y Redirect URLs para producción
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const PROJECT_REF = 'yhddnpcwhmeupwsjkchb'
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`

// URLs de producción
const PRODUCTION_URLS = {
  siteUrl: 'https://saku-store.vercel.app',
  additionalRedirectUrls: [
    'https://saku-store.vercel.app',
    'https://saku-store.vercel.app/auth/callback',
    'https://sakulenceria.com',
    'https://sakulenceria.com/auth/callback',
    'https://www.sakulenceria.com',
    'https://www.sakulenceria.com/auth/callback'
  ]
}

async function configureAuthUrls() {
  console.log('��� Configurando URLs de autenticación en Supabase...')
  
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE
  if (!serviceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE no encontrado en variables de entorno')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, serviceRoleKey)

  try {
    // Verificar conexión
    console.log('��� Verificando conexión a Supabase...')
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('id')
      .limit(1)

    if (testError) {
      console.error('❌ Error de conexión:', testError.message)
      process.exit(1)
    }

    console.log('✅ Conexión exitosa a Supabase')
    
    // Mostrar configuración que se aplicará
    console.log('\n��� Configuración a aplicar:')
    console.log(`   Site URL: ${PRODUCTION_URLS.siteUrl}`)
    console.log('   Redirect URLs:')
    PRODUCTION_URLS.additionalRedirectUrls.forEach(url => {
      console.log(`     - ${url}`)
    })

    console.log('\n⚠️  IMPORTANTE:')
    console.log('   Esta configuración debe aplicarse manualmente en Supabase Dashboard:')
    console.log('   1. Ve a https://supabase.com/dashboard/project/yhddnpcwhmeupwsjkchb/auth/url-configuration')
    console.log('   2. Configura Site URL:', PRODUCTION_URLS.siteUrl)
    console.log('   3. Agrega las siguientes Redirect URLs:')
    PRODUCTION_URLS.additionalRedirectUrls.forEach(url => {
      console.log(`      ${url}`)
    })
    console.log('   4. Para Google OAuth, configura Redirect URI en Google Console:')
    console.log('      https://saku-store.vercel.app/auth/callback')
    console.log('      https://sakulenceria.com/auth/callback')

    console.log('\n✅ Script completado. Configuración manual requerida en Dashboard.')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

// Ejecutar configuración
configureAuthUrls()
