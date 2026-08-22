-- ============================================================================
-- MEDICARE E-COMMERCE PLATFORM — SUPABASE DATABASE SCHEMA (PostgreSQL DDL)
-- Complete table structures, primary/foreign keys, JSONB columns, RLS policies
-- ============================================================================

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT 'Scrubs',
  specialty VARCHAR(50) NOT NULL CHECK (specialty IN ('medicine', 'pharmacy', 'dentistry', 'nursing', 'all')),
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),
  rating NUMERIC(3, 2) DEFAULT 5.00,
  reviews_count INT DEFAULT 0,
  material VARCHAR(100),
  brand VARCHAR(100) DEFAULT 'MEDICARE PRO',
  badge VARCHAR(50),
  colors JSONB DEFAULT '[]'::jsonb,
  sizes TEXT[] DEFAULT ARRAY['S','M','L','XL']::text[],
  images TEXT[] DEFAULT ARRAY[]::text[],
  short_description TEXT,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  specifications JSONB DEFAULT '{}'::jsonb,
  care_instructions TEXT[] DEFAULT ARRAY[]::text[],
  size_guide JSONB DEFAULT '{"enabled": true}'::jsonb,
  delivery_info TEXT,
  return_info TEXT,
  trust_badges TEXT[] DEFAULT ARRAY['🚚 58 Wilayas COD', '🔄 14-Day Free Exchange', '🛡️ Antimicrobial Shield']::text[],
  is_new BOOLEAN DEFAULT FALSE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  stock INT DEFAULT 20,
  min_stock INT DEFAULT 5,
  stock_by_variant JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration helpers to ensure existing tables receive new columns seamlessly
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Scrubs';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS care_instructions TEXT[] DEFAULT ARRAY[]::text[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS size_guide JSONB DEFAULT '{"enabled": true}'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS delivery_info TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS return_info TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS trust_badges TEXT[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS min_stock INT DEFAULT 5;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100) NOT NULL,
  specialty VARCHAR(50),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WILAYAS TABLE
CREATE TABLE IF NOT EXISTS public.wilayas (
  code VARCHAR(5) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  zone VARCHAR(20) NOT NULL CHECK (zone IN ('capital', 'north', 'south')),
  delivery_fee_home NUMERIC(8, 2) DEFAULT 400.00,
  delivery_fee_stopdesk NUMERIC(8, 2) DEFAULT 250.00
);

-- 4. COMMUNES TABLE
CREATE TABLE IF NOT EXISTS public.communes (
  id SERIAL PRIMARY KEY,
  wilaya_code VARCHAR(5) REFERENCES public.wilayas(code) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL
);

-- 5. ORDERS TABLE (Algerian COD Flow)
CREATE TABLE IF NOT EXISTS public.orders (
  id VARCHAR(50) PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  wilaya VARCHAR(100) NOT NULL,
  commune VARCHAR(100),
  address TEXT,
  delivery_type VARCHAR(20) DEFAULT 'home' CHECK (delivery_type IN ('home', 'stopdesk')),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10, 2) NOT NULL,
  delivery_fee NUMERIC(8, 2) DEFAULT 0.00,
  total NUMERIC(10, 2) NOT NULL,
  status VARCHAR(30) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Preparing', 'Shipped', 'Delivered', 'Cancelled')),
  coupon_code VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CUSTOMERS TABLE (Guest & Account Hub)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(150),
  medical_role VARCHAR(100),
  addresses JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  value NUMERIC(10, 2) NOT NULL,
  usage_limit INT DEFAULT 500,
  times_used INT DEFAULT 0,
  expires_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES public.products(id) ON DELETE CASCADE,
  customer_name VARCHAR(150) NOT NULL,
  specialty_tag VARCHAR(100),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  photo_url TEXT,
  is_approved BOOLEAN DEFAULT TRUE,
  helpful_votes INT DEFAULT 0,
  owner_reply TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. STAFF TABLE (Linked to Supabase Auth UUID)
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('Owner', 'Store Manager', 'Order Handler', 'Support & Content', 'Custom')),
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id SERIAL PRIMARY KEY,
  staff_name VARCHAR(150) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target VARCHAR(255) NOT NULL,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wilayas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
DROP POLICY IF EXISTS "Allow public read products" ON public.products;
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow auth insert products" ON public.products;
CREATE POLICY "Allow auth insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow auth update products" ON public.products;
CREATE POLICY "Allow auth update products" ON public.products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow auth delete products" ON public.products;
CREATE POLICY "Allow auth delete products" ON public.products FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow public read reviews" ON public.reviews;
CREATE POLICY "Allow public read reviews" ON public.reviews FOR SELECT USING (is_approved = true);

DROP POLICY IF EXISTS "Allow public insert reviews" ON public.reviews;
CREATE POLICY "Allow public insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow auth update reviews" ON public.reviews;
CREATE POLICY "Allow auth update reviews" ON public.reviews FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow auth delete reviews" ON public.reviews;
CREATE POLICY "Allow auth delete reviews" ON public.reviews FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow public insert orders" ON public.orders;
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select orders" ON public.orders;
CREATE POLICY "Allow public select orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow auth update orders" ON public.orders;
CREATE POLICY "Allow auth update orders" ON public.orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read staff" ON public.staff;
CREATE POLICY "Allow public read staff" ON public.staff FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow auth insert staff" ON public.staff;
CREATE POLICY "Allow auth insert staff" ON public.staff FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow auth update staff" ON public.staff;
CREATE POLICY "Allow auth update staff" ON public.staff FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow auth delete staff" ON public.staff;
CREATE POLICY "Allow auth delete staff" ON public.staff FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow public read wilayas" ON public.wilayas;
CREATE POLICY "Allow public read wilayas" ON public.wilayas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read communes" ON public.communes;
CREATE POLICY "Allow public read communes" ON public.communes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read coupons" ON public.coupons;
CREATE POLICY "Allow public read coupons" ON public.coupons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);

-- 11. SUBSCRIBERS TABLE (Newsletter / VIP Updates)
CREATE TABLE IF NOT EXISTS public.subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert subscribers" ON public.subscribers;
CREATE POLICY "Allow public insert subscribers" ON public.subscribers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow auth select subscribers" ON public.subscribers;
CREATE POLICY "Allow auth select subscribers" ON public.subscribers FOR SELECT TO authenticated USING (true);

