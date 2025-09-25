-- Migración para ajustar RLS en profiles para permitir el trigger
-- Fecha: 2025-01-23

-- 1. Verificar y ajustar políticas RLS para la tabla profiles
-- Permitir que el trigger (ejecutado como service_role) pueda insertar

-- Eliminar políticas existentes que puedan estar bloqueando
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON profiles;

-- Crear políticas más permisivas para el trigger
CREATE POLICY "Service role can manage all profiles" ON profiles
  FOR ALL USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. Asegurar que la función del trigger tenga los permisos correctos
-- Otorgar permisos explícitos en la tabla profiles
GRANT ALL ON profiles TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- 3. Recrear la función con configuración más explícita
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  profile_id uuid;
BEGIN
  -- Log de inicio
  RAISE NOTICE 'Trigger iniciado para usuario: %', NEW.id;
  
  -- Insertar en profiles con manejo de errores
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    phone, 
    marketing_consent, 
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE((NEW.raw_user_meta_data->>'marketing_consent')::boolean, false),
    CASE 
      WHEN NEW.email = 'aguirrealexis.cba@gmail.com' THEN 'admin'
      ELSE 'customer'
    END,
    NOW(),
    NOW()
  )
  RETURNING id INTO profile_id;
  
  -- Log exitoso
  RAISE NOTICE 'Profile creado exitosamente: %', profile_id;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log detallado del error
    RAISE WARNING 'Error en trigger handle_new_user para usuario %: % (SQLSTATE: %) - DETAIL: %', 
      NEW.id, SQLERRM, SQLSTATE, SQLSTATE;
    -- No fallar la creación del usuario
    RETURN NEW;
END;
$$;

-- 4. Otorgar permisos específicos a la función
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- 5. Verificar que el trigger existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created' 
    AND event_object_table = 'users'
    AND event_object_schema = 'auth'
  ) THEN
    RAISE NOTICE 'Trigger on_auth_user_created confirmado';
  ELSE
    RAISE WARNING 'Trigger on_auth_user_created NO encontrado';
  END IF;
END $$;