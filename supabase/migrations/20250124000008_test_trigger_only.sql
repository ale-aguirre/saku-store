-- Test trigger functionality without modifying auth.users
-- The trigger exists, let's just ensure our function is correct

-- Recreate the function with better logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role text := 'customer';
BEGIN
    -- Log the trigger execution (this will appear in Supabase logs)
    RAISE LOG 'AUTH TRIGGER: Processing new user %', NEW.id;
    RAISE LOG 'AUTH TRIGGER: User email %', NEW.email;
    
    -- Determine role based on email
    IF NEW.email LIKE '%@saku.com.ar' THEN
        user_role := 'admin';
        RAISE LOG 'AUTH TRIGGER: Assigning admin role';
    ELSE
        RAISE LOG 'AUTH TRIGGER: Assigning customer role';
    END IF;
    
    -- Insert profile
    INSERT INTO public.profiles (id, email, role, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        user_role::user_role,
        NOW(),
        NOW()
    );
    
    RAISE LOG 'AUTH TRIGGER: Profile created successfully for %', NEW.email;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'AUTH TRIGGER ERROR: % for user %', SQLERRM, NEW.email;
        -- Don't fail the auth process, just log the error
        RETURN NEW;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;

-- Function to test if trigger is working
CREATE OR REPLACE FUNCTION public.test_auth_trigger_status()
RETURNS TABLE(
    trigger_exists boolean,
    function_exists boolean,
    recent_profiles_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXISTS(
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_name = 'on_auth_user_created' 
            AND event_object_table = 'users'
            AND event_object_schema = 'auth'
        ) as trigger_exists,
        EXISTS(
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'handle_new_user'
            AND routine_schema = 'public'
        ) as function_exists,
        (SELECT COUNT(*) FROM public.profiles WHERE created_at > NOW() - INTERVAL '1 hour') as recent_profiles_count;
END;
$$;

-- Grant permissions for the test function
GRANT EXECUTE ON FUNCTION public.test_auth_trigger_status() TO service_role;
GRANT EXECUTE ON FUNCTION public.test_auth_trigger_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_auth_trigger_status() TO anon;