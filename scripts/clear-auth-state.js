require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clearAuthState() {
  try {
    console.log('🧹 Limpiando estado de autenticación...');
    
    // 1. Verificar sesión actual
    console.log('\n1️⃣ Verificando sesión actual...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Error obteniendo sesión:', sessionError);
    } else if (session) {
      console.log('⚠️  Sesión encontrada:');
      console.log(`   Usuario: ${session.user.email}`);
      console.log(`   Expira: ${new Date(session.expires_at * 1000).toLocaleString()}`);
      console.log(`   Token válido: ${session.access_token ? 'Sí' : 'No'}`);
      
      // Cerrar sesión
      console.log('\n🚪 Cerrando sesión...');
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.error('❌ Error cerrando sesión:', signOutError);
      } else {
        console.log('✅ Sesión cerrada correctamente');
      }
    } else {
      console.log('✅ No hay sesión activa');
    }
    
    // 2. Verificar sesión después del signOut
    console.log('\n2️⃣ Verificando sesión después de limpiar...');
    const { data: { session: newSession }, error: newSessionError } = await supabase.auth.getSession();
    
    if (newSessionError) {
      console.error('❌ Error verificando nueva sesión:', newSessionError);
    } else if (newSession) {
      console.log('⚠️  Aún hay sesión activa (puede ser normal en algunos casos)');
    } else {
      console.log('✅ No hay sesión activa - estado limpio');
    }
    
    // 3. Simular el comportamiento del hook use-auth
    console.log('\n3️⃣ Simulando comportamiento del hook use-auth...');
    
    const { data: { session: testSession }, error: testError } = await supabase.auth.getSession();
    
    if (testError) {
      console.log('❌ Error en getSession (como en el hook):', testError);
    } else if (testSession?.user) {
      console.log('⚠️  Se detectó usuario - se llamaría fetchUserProfile');
      console.log(`   ID: ${testSession.user.id}`);
      console.log(`   Email: ${testSession.user.email}`);
      
      // Simular fetchUserProfile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testSession.user.id)
        .single();
      
      if (profileError) {
        console.log('❌ Error fetchUserProfile (este sería el error que ves):', profileError);
      } else {
        console.log('✅ Perfil encontrado:', profile);
      }
    } else {
      console.log('✅ No hay usuario - NO se llamaría fetchUserProfile');
    }
    
    console.log('\n📋 Resumen:');
    console.log('- Si ves el error "Error fetching user profile: {}" significa que:');
    console.log('  1. Supabase detecta una sesión de usuario');
    console.log('  2. Pero no encuentra el perfil correspondiente en la tabla profiles');
    console.log('- Si no hay usuarios autenticados, el error NO debería aparecer');
    console.log('- Refresca la página para ver si el error persiste');
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

clearAuthState().then(() => {
  console.log('\n✅ Limpieza completada');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});