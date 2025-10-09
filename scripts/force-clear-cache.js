require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function forceClearCache() {
  try {
    console.log('🧹 LIMPIEZA FORZADA DE CACHE Y SESIONES');
    console.log('=====================================\n');
    
    // 1. Limpiar todas las sesiones posibles
    console.log('1️⃣ Limpiando sesiones del servidor...');
    
    try {
      await supabase.auth.signOut({ scope: 'global' });
      console.log('✅ SignOut global ejecutado');
    } catch (error) {
      console.log('⚠️  Error en signOut global (puede ser normal):', error.message);
    }
    
    try {
      await supabase.auth.signOut({ scope: 'local' });
      console.log('✅ SignOut local ejecutado');
    } catch (error) {
      console.log('⚠️  Error en signOut local (puede ser normal):', error.message);
    }
    
    // 2. Verificar estado final
    console.log('\n2️⃣ Verificando estado final...');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('⚠️  Error obteniendo sesión:', error.message);
    } else if (session) {
      console.log('⚠️  Aún hay sesión detectada:', {
        user: session.user?.email,
        expires: new Date(session.expires_at * 1000).toLocaleString()
      });
    } else {
      console.log('✅ No hay sesión activa');
    }
    
    console.log('\n📋 INSTRUCCIONES PARA LIMPIAR EL NAVEGADOR:');
    console.log('==========================================');
    console.log('1. Abre las herramientas de desarrollador (F12)');
    console.log('2. Ve a la pestaña "Application" o "Aplicación"');
    console.log('3. En el panel izquierdo, busca "Storage" o "Almacenamiento"');
    console.log('4. Haz clic en "Clear storage" o "Limpiar almacenamiento"');
    console.log('5. Marca todas las casillas y haz clic en "Clear site data"');
    console.log('');
    console.log('ALTERNATIVA RÁPIDA:');
    console.log('- Presiona Ctrl+Shift+Delete');
    console.log('- Selecciona "Todo el tiempo" como rango');
    console.log('- Marca: Cookies, Datos de sitios web, Imágenes y archivos en caché');
    console.log('- Haz clic en "Eliminar datos"');
    console.log('');
    console.log('DESPUÉS DE LIMPIAR:');
    console.log('- Cierra completamente el navegador');
    console.log('- Abre una nueva ventana');
    console.log('- Ve a http://localhost:3000/admin/contenido-home');
    console.log('- Abre la consola (F12) y verifica si el error persiste');
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

forceClearCache().then(() => {
  console.log('\n✅ Limpieza del servidor completada');
  console.log('👆 Sigue las instrucciones de arriba para limpiar el navegador');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});