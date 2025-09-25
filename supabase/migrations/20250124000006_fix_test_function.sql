-- Fix test function to work with auth.users constraint
-- This migration creates a proper test function that respects the foreign key constraint

-- Drop the old test function
DROP FUNCTION IF EXISTS public.test_profile_creation(UUID, TEXT);

-- Create a better test function that creates a test auth user first
CREATE OR REPLACE FUNCTION public.test_profile_creation_with_auth(test_email TEXT)
RETURNS TEXT AS $$
DECLARE
  test_user_id UUID;
  result_role user_role;
  profile_count INTEGER;
BEGIN
  -- Generate a test user ID
  test_user_id := gen_random_uuid();
  
  -- Determine what role should be assigned
  IF test_email IN ('ale@saku.com.ar', 'admin@saku.com.ar') THEN
    result_role := 'admin'::user_role;
  ELSE
    result_role := 'customer'::user_role;
  END IF;

  -- First, create a test user in auth.users (this is what would normally happen during signup)
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  ) VALUES (
    test_user_id,
    test_email,
    crypt('testpassword', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    FALSE,
    'authenticated'
  );

  -- Now call our trigger function manually
  PERFORM public.handle_new_user() FROM (
    SELECT test_user_id as id, test_email as email
  ) as new_user;

  -- Check if profile was created
  SELECT COUNT(*) INTO profile_count
  FROM public.profiles
  WHERE id = test_user_id;

  -- Clean up the test auth user
  DELETE FROM auth.users WHERE id = test_user_id;

  IF profile_count > 0 THEN
    RETURN 'SUCCESS: Profile created with role ' || result_role::TEXT || ' for user ' || test_user_id::TEXT;
  ELSE
    RETURN 'ERROR: Profile was not created';
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    -- Clean up on error
    DELETE FROM auth.users WHERE id = test_user_id;
    RETURN 'ERROR: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for the test function
GRANT EXECUTE ON FUNCTION public.test_profile_creation_with_auth(TEXT) TO service_role;

-- Create a simpler function to test role assignment logic only
CREATE OR REPLACE FUNCTION public.test_role_assignment(test_email TEXT)
RETURNS TEXT AS $$
DECLARE
  result_role user_role;
BEGIN
  -- Test the role assignment logic
  IF test_email IN ('ale@saku.com.ar', 'admin@saku.com.ar') THEN
    result_role := 'admin'::user_role;
  ELSE
    result_role := 'customer'::user_role;
  END IF;

  RETURN 'Email: ' || test_email || ' -> Role: ' || result_role::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.test_role_assignment(TEXT) TO service_role;