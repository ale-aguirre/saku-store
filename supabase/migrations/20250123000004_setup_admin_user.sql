-- Create admin user profile
-- This will be triggered automatically when the user signs up via the handle_new_user() function
-- But we can also create a placeholder profile that will be updated when the user first logs in

-- Insert admin profile if it doesn't exist
-- Note: The actual user creation happens through Supabase Auth UI
-- This just ensures the profile will have admin role when created

-- Create a function to set admin role for specific email
CREATE OR REPLACE FUNCTION public.set_admin_role_for_email(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  -- Update existing profile to admin if it exists
  UPDATE public.profiles 
  SET role = 'admin'
  WHERE email = user_email;
  
  -- If no rows were updated, the profile doesn't exist yet
  -- The trigger will handle setting the role when the user signs up
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to check for admin emails
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

-- Set admin role for the specific email if profile already exists
SELECT public.set_admin_role_for_email('aguirrealexis.cba@gmail.com');