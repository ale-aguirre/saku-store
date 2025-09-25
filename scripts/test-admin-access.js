#!/usr/bin/env node

/**
 * Script para verificar el acceso de administración
 * Verifica usuarios, roles y configuración de autenticación
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno faltantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAdminAccess() {
  console.log('🔍 Verificando acceso de administración...\n')

  try {
    // 1. Verificar usuarios en auth.users
    console.log('👥 Verificando usuarios en auth.users...')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error al obtener usuarios de auth:', authError.message)
      return
    }

    console.log(`✅ Usuarios en auth.users: ${authUsers.users.length}`)
    authUsers.users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} (ID: ${user.id})`)
      console.log(`     Confirmado: ${user.email_confirmed_at ? '✅' : '❌'}`)
      console.log(`     Creado: ${new Date(user.created_at).toLocaleDateString('es-AR')}`)
    })

    // 2. Verificar perfiles
    console.log('\n👤 Verificando perfiles...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')

    if (profilesError) {
      console.error('❌ Error al obtener perfiles:', profilesError.message)
      return
    }

    console.log(`✅ Perfiles encontrados: ${profiles.length}`)
    profiles.forEach((profile, index) => {
      console.log(`  ${index + 1}. ${profile.email || 'Sin email'} (${profile.role})`)
      console.log(`     ID: ${profile.id}`)
      console.log(`     Nombre: ${profile.first_name} ${profile.last_name}`)
    })

    // 3. Verificar administradores específicamente
    console.log('\n🛡️ Verificando administradores...')
    const { data: admins, error: adminsError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')

    if (adminsError) {
      console.error('❌ Error al obtener administradores:', adminsError.message)
      return
    }

    console.log(`✅ Administradores encontrados: ${admins.length}`)
    admins.forEach((admin, index) => {
      console.log(`  ${index + 1}. ${admin.email || 'Sin email'}`)
      console.log(`     ID: ${admin.id}`)
      console.log(`     Nombre: ${admin.first_name} ${admin.last_name}`)
    })

    // 4. Verificar si hay discrepancias entre auth.users y profiles
    console.log('\n🔄 Verificando sincronización auth.users <-> profiles...')
    const authUserIds = authUsers.users.map(u => u.id)
    const profileIds = profiles.map(p => p.id)

    const missingProfiles = authUserIds.filter(id => !profileIds.includes(id))
    const orphanProfiles = profileIds.filter(id => !authUserIds.includes(id))

    if (missingProfiles.length > 0) {
      console.log('⚠️ Usuarios sin perfil:')
      missingProfiles.forEach(id => {
        const user = authUsers.users.find(u => u.id === id)
        console.log(`  - ${user?.email} (${id})`)
      })
    }

    if (orphanProfiles.length > 0) {
      console.log('⚠️ Perfiles sin usuario:')
      orphanProfiles.forEach(id => {
        const profile = profiles.find(p => p.id === id)
        console.log(`  - ${profile?.email} (${id})`)
      })
    }

    if (missingProfiles.length === 0 && orphanProfiles.length === 0) {
      console.log('✅ Sincronización correcta entre auth.users y profiles')
    }

    // 5. Verificar políticas RLS en profiles
    console.log('\n🔒 Verificando políticas RLS...')
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_name: 'profiles' })
      .catch(() => {
        // Si la función no existe, intentamos una consulta directa
        return supabase
          .from('pg_policies')
          .select('*')
          .eq('tablename', 'profiles')
      })

    if (!policiesError && policies) {
      console.log(`✅ Políticas RLS encontradas: ${policies.length}`)
    } else {
      console.log('⚠️ No se pudieron verificar las políticas RLS')
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message)
  }
}

// Ejecutar verificación
testAdminAccess()
  .then(() => {
    console.log('\n✅ Verificación de acceso de administración completada')
  })
  .catch((error) => {
    console.error('❌ Error en la verificación:', error)
    process.exit(1)
  })