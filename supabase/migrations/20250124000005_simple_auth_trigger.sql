-- Simple and robust auth trigger
-- This migration creates a minimal, working auth trigger

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.test_handle_new_user(UUID, TEXT);

-- Create a simple function that just creates the profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple insert with minimal logic
  INSERT INTO public.profiles (
    id,
    email,
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN NEW.email IN ('ale@saku.com.ar', 'admin@saku.com.ar') THEN 'admin'::user_role
      ELSE 'customer'::user_role
    END,
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth process
    RAISE LOG 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Create a simple test function
CREATE OR REPLACE FUNCTION public.test_profile_creation(test_user_id UUID, test_email TEXT)
RETURNS TEXT AS $$
DECLARE
  result_role user_role;
BEGIN
  -- Determine what role should be assigned
  IF test_email IN ('ale@saku.com.ar', 'admin@saku.com.ar') THEN
    result_role := 'admin'::user_role;
  ELSE
    result_role := 'customer'::user_role;
  END IF;

  -- Try to insert the profile
  INSERT INTO public.profiles (
    id,
    email,
    role,
    created_at,
    updated_at
  ) VALUES (
    test_user_id,
    test_email,
    result_role,
    NOW(),
    NOW()
  );

  RETURN 'SUCCESS: Profile created with role ' || result_role::TEXT;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'ERROR: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for the test function
GRANT EXECUTE ON FUNCTION public.test_profile_creation(UUID, TEXT) TO service_role;