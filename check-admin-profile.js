require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

async function checkAdminProfile() {
  console.log('Verificando perfil del usuario admin...');
  
  try {
    // Buscar el usuario admin
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error('Error obteniendo usuarios:', authError);
      return;
    }
    
    const adminUser = authUsers.users.find(u => u.email === 'admin@saku.com');
    if (!adminUser) {
      console.log('Usuario admin no encontrado');
      return;
    }
    
    console.log('Usuario admin encontrado:', adminUser.id);
    
    // Verificar si tiene perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', adminUser.id)
      .single();
      
    if (profileError) {
      console.error('Error obteniendo perfil:', profileError);
      
      // Crear perfil si no existe
      console.log('Creando perfil para usuario admin...');
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: adminUser.id,
          email: adminUser.email,
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin'
        })
        .select()
        .single();
        
      if (createError) {
        console.error('Error creando perfil:', createError);
      } else {
        console.log('Perfil creado:', newProfile);
      }
    } else {
      console.log('Perfil encontrado:', profile);
    }
  } catch (error) {
    console.error('Error general:', error);
  }
}

checkAdminProfile();