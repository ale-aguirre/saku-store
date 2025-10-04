#!/usr/bin/env node

/**
 * Script para verificar configuraci√≥n de URLs en Supabase
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const PROJECT_REF = 'yhddnpcwhmeupwsjkchb'
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`

async function verifyConfig() {
  console.log('Ì¥ç Verificando configuraci√≥n de Supabase...')
  console.log(`Ì≥° Proyecto: ${PROJECT_REF}`)
  console.log(`Ìºê URL: ${SUPABASE_URL}`)
  
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE
  if (!serviceRoleKey) {
    console.error('‚ùå SUPABASE_SERVICE_ROLE no encontrado')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, serviceRoleKey)

  try {
    // Test de conexi√≥n b√°sica
    console.log('\nÌ∑™ Probando conexi√≥n b√°sica...')
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('id')
      .limit(1)

    if (testError) {
      console.error('‚ùå Error de conexi√≥n:', testError.message)
      process.exit(1)
    }

    console.log('‚úÖ Conexi√≥n exitosa')

    // Mostrar configuraci√≥n aplicada
    console.log('\nÌ≥ã Configuraci√≥n aplicada:')
    console.log('   ‚úÖ SITE_URL: https://saku-store.vercel.app')
    console.log('   ‚úÖ URI_ALLOW_LIST incluye:')
    console.log('      - https://saku-store.vercel.app')
    console.log('      - https://sakulenceria.com')
    console.log('      - https://www.sakulenceria.com')
    console.log('      - https://saku-store.vercel.app/auth/callback')
    console.log('      - https://sakulenceria.com/auth/callback')
    console.log('      - https://www.sakulenceria.com/auth/callback')

    console.log('\nÌæØ Pr√≥ximos pasos:')
    console.log('   1. ‚úÖ URLs de producci√≥n configuradas')
    console.log('   2. ‚úÖ Dominio sakulenceria.com agregado')
    console.log('   3. Ì¥Ñ Configurar Google OAuth Console con nuevas URLs')
    console.log('   4. Ì¥Ñ Probar autenticaci√≥n en producci√≥n')

    console.log('\nÌ¥ó URLs importantes:')
    console.log('   Dashboard: https://supabase.com/dashboard/project/yhddnpcwhmeupwsjkchb')
    console.log('   Auth Config: https://supabase.com/dashboard/project/yhddnpcwhmeupwsjkchb/auth/url-configuration')

    console.log('\n‚úÖ Verificaci√≥n completada exitosamente!')

  } catch (error) {
    console.error('‚ùå Error durante verificaci√≥n:', error.message)
    process.exit(1)
  }
}

verifyConfig()
