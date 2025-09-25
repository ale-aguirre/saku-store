-- ============================================
-- SCRIPT PARA CONFIGURAR FUNCIONES DE ADMIN
-- ============================================
-- Ejecuta este script en el SQL Editor de Supabase Dashboard
-- https://supabase.com/dashboard/project/[tu-project-id]/sql

-- 1. Crear función para asignar rol de admin
CREATE OR REPLACE FUNCTION public.set_admin_role_for_email(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles 
  SET role = 'admin'
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Crear función handle_new_user (trigger para nuevos usuarios)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    CASE 
      WHEN NEW.email = 'aguirrealexis.cba@gmail.com' THEN 'admin'::user_role
      ELSE 'customer'::user_role
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crear trigger para ejecutar la función automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Asignar rol de admin al email específico si ya existe
SELECT public.set_admin_role_for_email('aguirrealexis.cba@gmail.com');

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecuta estas consultas para verificar que todo funciona:

-- Verificar que la función existe
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
AND routine_schema = 'public';

-- Verificar que el trigger existe
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Verificar perfiles existentes
SELECT email, role FROM public.profiles;