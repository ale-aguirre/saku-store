-- Sakú Lencería - Row Level Security Policies
-- Created: 2025-01-21
-- Description: Comprehensive RLS policies for secure data access

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE copy_blocks ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role IN ('admin', 'super_admin')
        FROM users
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'super_admin'
        FROM users
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- USERS TABLE POLICIES
-- =============================================

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own data (except role)
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        (OLD.role = NEW.role OR is_admin()) -- Only admins can change roles
    );

-- Admins can read all users
CREATE POLICY "Admins can read all users" ON users
    FOR SELECT USING (is_admin());

-- Admins can update all users
CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (is_admin());

-- Super admins can insert users
CREATE POLICY "Super admins can insert users" ON users
    FOR INSERT WITH CHECK (is_super_admin());

-- =============================================
-- USER ADDRESSES POLICIES
-- =============================================

-- Users can manage their own addresses
CREATE POLICY "Users can manage own addresses" ON user_addresses
    FOR ALL USING (auth.uid() = user_id);

-- Admins can read all addresses
CREATE POLICY "Admins can read all addresses" ON user_addresses
    FOR SELECT USING (is_admin());

-- =============================================
-- PRODUCT CATALOG POLICIES (PUBLIC READ)
-- =============================================

-- Categories are publicly readable
CREATE POLICY "Categories are publicly readable" ON categories
    FOR SELECT USING (is_active = true);

-- Admins can manage categories
CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (is_admin());

-- Products are publicly readable when active
CREATE POLICY "Products are publicly readable" ON products
    FOR SELECT USING (is_active = true);

-- Admins can manage products
CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (is_admin());

-- Product images are publicly readable
CREATE POLICY "Product images are publicly readable" ON product_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products p
            WHERE p.id = product_images.product_id
            AND p.is_active = true
        )
    );

-- Admins can manage product images
CREATE POLICY "Admins can manage product images" ON product_images
    FOR ALL USING (is_admin());

-- Product variants are publicly readable when active
CREATE POLICY "Product variants are publicly readable" ON product_variants
    FOR SELECT USING (
        is_active = true AND
        EXISTS (
            SELECT 1 FROM products p
            WHERE p.id = product_variants.product_id
            AND p.is_active = true
        )
    );

-- Admins can manage product variants
CREATE POLICY "Admins can manage product variants" ON product_variants
    FOR ALL USING (is_admin());

-- =============================================
-- INVENTORY POLICIES
-- =============================================

-- Admins can manage inventory movements
CREATE POLICY "Admins can manage inventory" ON inventory_movements
    FOR ALL USING (is_admin());

-- =============================================
-- COUPONS POLICIES
-- =============================================

-- Active coupons are publicly readable (for validation)
CREATE POLICY "Active coupons are publicly readable" ON coupons
    FOR SELECT USING (
        is_active = true AND
        (starts_at IS NULL OR starts_at <= NOW()) AND
        (ends_at IS NULL OR ends_at >= NOW())
    );

-- Admins can manage coupons
CREATE POLICY "Admins can manage coupons" ON coupons
    FOR ALL USING (is_admin());

-- Users can read their own coupon usages
CREATE POLICY "Users can read own coupon usages" ON coupon_usages
    FOR SELECT USING (auth.uid() = user_id);

-- System can insert coupon usages
CREATE POLICY "System can insert coupon usages" ON coupon_usages
    FOR INSERT WITH CHECK (true);

-- Admins can read all coupon usages
CREATE POLICY "Admins can read all coupon usages" ON coupon_usages
    FOR SELECT USING (is_admin());

-- =============================================
-- CART POLICIES
-- =============================================

-- Users can manage their own carts
CREATE POLICY "Users can manage own carts" ON carts
    FOR ALL USING (
        auth.uid() = user_id OR
        (user_id IS NULL AND session_id IS NOT NULL) -- Anonymous carts
    );

-- Users can manage their own cart items
CREATE POLICY "Users can manage own cart items" ON cart_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM carts c
            WHERE c.id = cart_items.cart_id
            AND (c.user_id = auth.uid() OR c.session_id IS NOT NULL)
        )
    );

-- =============================================
-- ORDERS POLICIES
-- =============================================

-- Users can read their own orders
CREATE POLICY "Users can read own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can read all orders
CREATE POLICY "Admins can read all orders" ON orders
    FOR SELECT USING (is_admin());

-- System can insert orders (during checkout)
CREATE POLICY "System can insert orders" ON orders
    FOR INSERT WITH CHECK (true);

-- Admins can update orders
CREATE POLICY "Admins can update orders" ON orders
    FOR UPDATE USING (is_admin());

-- Users can read their own order items
CREATE POLICY "Users can read own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = order_items.order_id
            AND o.user_id = auth.uid()
        )
    );

-- Admins can read all order items
CREATE POLICY "Admins can read all order items" ON order_items
    FOR SELECT USING (is_admin());

-- System can insert order items
CREATE POLICY "System can insert order items" ON order_items
    FOR INSERT WITH CHECK (true);

-- Users can read events for their orders
CREATE POLICY "Users can read own order events" ON order_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = order_events.order_id
            AND o.user_id = auth.uid()
        )
    );

-- Admins can manage order events
CREATE POLICY "Admins can manage order events" ON order_events
    FOR ALL USING (is_admin());

-- System can insert order events
CREATE POLICY "System can insert order events" ON order_events
    FOR INSERT WITH CHECK (true);

-- =============================================
-- CRM POLICIES
-- =============================================

-- Users can read their own customer segment
CREATE POLICY "Users can read own segment" ON customer_segments
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can read all customer segments
CREATE POLICY "Admins can read all segments" ON customer_segments
    FOR SELECT USING (is_admin());

-- System can manage customer segments
CREATE POLICY "System can manage segments" ON customer_segments
    FOR ALL USING (is_admin());

-- Users can read their own NPS surveys
CREATE POLICY "Users can read own NPS" ON nps_surveys
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own NPS responses
CREATE POLICY "Users can respond to NPS" ON nps_surveys
    FOR UPDATE USING (auth.uid() = user_id AND responded_at IS NULL);

-- Admins can manage NPS surveys
CREATE POLICY "Admins can manage NPS" ON nps_surveys
    FOR ALL USING (is_admin());

-- =============================================
-- MARKETING POLICIES
-- =============================================

-- Admins can manage email templates
CREATE POLICY "Admins can manage email templates" ON email_templates
    FOR ALL USING (is_admin());

-- Admins can manage campaigns
CREATE POLICY "Admins can manage campaigns" ON campaigns
    FOR ALL USING (is_admin());

-- Admins can manage automations
CREATE POLICY "Admins can manage automations" ON automations
    FOR ALL USING (is_admin());

-- System can log automation executions
CREATE POLICY "System can log automation executions" ON automation_executions
    FOR INSERT WITH CHECK (true);

-- Admins can read automation executions
CREATE POLICY "Admins can read automation executions" ON automation_executions
    FOR SELECT USING (is_admin());

-- =============================================
-- SITE CONFIGURATION POLICIES
-- =============================================

-- Public site settings are readable by everyone
CREATE POLICY "Public site settings are readable" ON site_settings
    FOR SELECT USING (is_public = true);

-- Admins can manage all site settings
CREATE POLICY "Admins can manage site settings" ON site_settings
    FOR ALL USING (is_admin());

-- Active copy blocks are publicly readable
CREATE POLICY "Active copy blocks are readable" ON copy_blocks
    FOR SELECT USING (is_active = true);

-- Admins can manage copy blocks
CREATE POLICY "Admins can manage copy blocks" ON copy_blocks
    FOR ALL USING (is_admin());