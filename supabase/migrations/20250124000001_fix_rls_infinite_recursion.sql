-- Fix infinite recursion in RLS policies
-- The problem: admin policies were querying profiles table from within profiles policies

-- Drop all problematic policies first
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all addresses" ON addresses;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Admins can manage product variants" ON product_variants;
DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;
DROP POLICY IF EXISTS "Admins can view all carts" ON carts;
DROP POLICY IF EXISTS "Admins can view all cart items" ON cart_items;
DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
DROP POLICY IF EXISTS "Admins can manage all order events" ON order_events;

-- Create a function to check if user is admin using auth.jwt()
-- This avoids querying the profiles table from within profiles policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the user has admin role in their JWT claims
  -- This will be set when the user logs in
  RETURN COALESCE(
    (auth.jwt() ->> 'user_role')::text = 'admin',
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alternative function that uses auth.uid() directly for service role
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  -- For service role operations, we can bypass RLS
  -- For regular users, we need to check without causing recursion
  IF auth.role() = 'service_role' THEN
    RETURN EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = user_id AND role = 'admin'
    );
  END IF;
  
  -- For authenticated users, use JWT claims to avoid recursion
  RETURN COALESCE(
    (auth.jwt() ->> 'user_role')::text = 'admin',
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate profiles policies without recursion
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (public.is_admin_user());

-- Recreate other admin policies using the safe function
CREATE POLICY "Admins can view all addresses" ON addresses
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (public.is_admin_user());

CREATE POLICY "Admins can manage product variants" ON product_variants
  FOR ALL USING (public.is_admin_user());

CREATE POLICY "Admins can manage coupons" ON coupons
  FOR ALL USING (public.is_admin_user());

CREATE POLICY "Admins can view all carts" ON carts
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Admins can view all cart items" ON cart_items
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Admins can manage all orders" ON orders
  FOR ALL USING (public.is_admin_user());

CREATE POLICY "Admins can view all order items" ON order_items
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Admins can manage all order events" ON order_events
  FOR ALL USING (public.is_admin_user());

-- Create a function to set user role in JWT claims on login
-- This will be called by our auth hook to populate the JWT with role info
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = user_id;
  
  RETURN COALESCE(user_role, 'customer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated, anon, service_role;