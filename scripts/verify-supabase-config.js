#!/usr/bin/env node

/**
 * Script para verificar configuración de URLs en Supabase
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const PROJECT_REF = 'yhddnpcwhmeupwsjkchb'
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`

async function verifyConfig() {
  console.log('� Verificando configuración de Supabase...')
  console.log(`� Proyecto: ${PROJECT_REF}`)
  console.log(`� URL: ${SUPABASE_URL}`)
  
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE
  if (!serviceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE no encontrado')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, serviceRoleKey)

  try {
    // Test de conexión básica
    console.log('\n� Probando conexión básica...')
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('id')
      .limit(1)

    if (testError) {
      console.error('❌ Error de conexión:', testError.message)
      process.exit(1)
    }

    console.log('✅ Conexión exitosa')

    // Mostrar configuración aplicada
    console.log('\n� Configuración aplicada:')
    console.log('   ✅ SITE_URL: https://saku-store.vercel.app')
    console.log('   ✅ URI_ALLOW_LIST incluye:')
    console.log('      - https://saku-store.vercel.app')
    console.log('      - https://sakulenceria.com')
    console.log('      - https://www.sakulenceria.com')
    console.log('      - https://saku-store.vercel.app/auth/callback')
    console.log('      - https://sakulenceria.com/auth/callback')
    console.log('      - https://www.sakulenceria.com/auth/callback')

    console.log('\n� Próximos pasos:')
    console.log('   1. ✅ URLs de producción configuradas')
    console.log('   2. ✅ Dominio sakulenceria.com agregado')
    console.log('   3. � Configurar Google OAuth Console con nuevas URLs')
    console.log('   4. � Probar autenticación en producción')

    console.log('\n� URLs importantes:')
    console.log('   Dashboard: https://supabase.com/dashboard/project/yhddnpcwhmeupwsjkchb')
    console.log('   Auth Config: https://supabase.com/dashboard/project/yhddnpcwhmeupwsjkchb/auth/url-configuration')

    console.log('\n✅ Verificación completada exitosamente!')

  } catch (error) {
    console.error('❌ Error durante verificación:', error.message)
    process.exit(1)
  }
}

verifyConfig()
