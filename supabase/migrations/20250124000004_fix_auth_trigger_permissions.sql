-- Fix auth trigger permissions and ensure it works correctly
-- This migration addresses permission issues with the auth trigger

-- First, let's ensure the function exists and has correct permissions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role user_role := 'customer';
BEGIN
  -- Determine role based on email
  IF NEW.email = 'ale@saku.com.ar' OR NEW.email = 'admin@saku.com.ar' THEN
    user_role := 'admin';
  END IF;

  -- Insert into public.profiles
  INSERT INTO public.profiles (
    id,
    email,
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    user_role::user_role,
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth process
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger to ensure it's properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant all necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Ensure the function can access the profiles table
GRANT INSERT ON public.profiles TO authenticated;
GRANT INSERT ON public.profiles TO anon;

-- Test the function by creating a test function that we can call
CREATE OR REPLACE FUNCTION public.test_handle_new_user(test_user_id UUID, test_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role user_role := 'customer';
  result BOOLEAN := FALSE;
BEGIN
  -- Determine role based on email
  IF test_email = 'ale@saku.com.ar' OR test_email = 'admin@saku.com.ar' THEN
    user_role := 'admin';
  END IF;

  -- Insert into public.profiles
  INSERT INTO public.profiles (
    id,
    email,
    role,
    created_at,
    updated_at
  ) VALUES (
    test_user_id,
    test_email,
    user_role::user_role,
    NOW(),
    NOW()
  );

  result := TRUE;
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Test function failed for user %: %', test_user_id, SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for the test function
GRANT EXECUTE ON FUNCTION public.test_handle_new_user(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_handle_new_user(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.test_handle_new_user(UUID, TEXT) TO service_role;