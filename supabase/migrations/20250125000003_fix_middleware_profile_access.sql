-- Migración para permitir acceso al perfil en middleware
-- Fecha: 2025-01-25

-- El middleware necesita poder leer el perfil del usuario para verificar el rol
-- Agregar política que permita a usuarios autenticados leer su propio perfil

-- Eliminar política existente si existe
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Crear política que funcione tanto en el frontend como en el middleware
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    auth.jwt() ->> 'sub' = id::text
  );

-- Asegurar que la tabla tenga RLS habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Comentario explicativo
COMMENT ON POLICY "Users can view own profile" ON profiles IS 
'Permite a usuarios autenticados leer su propio perfil. Funciona tanto con auth.uid() (frontend) como con auth.jwt() (middleware).';