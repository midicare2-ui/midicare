-- ============================================================================
-- MEDICARE — COMPLETE SUPABASE SQL FIX (Columns, Storage Bucket, RLS Policies)
-- Copy and run this entire script once in the Supabase SQL Editor.
-- ============================================================================

-- 1. ADD ALL ADVANCED & LOCALIZATION (EN/AR/FR) COLUMNS TO PRODUCTS TABLE
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku VARCHAR(50);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Scrubs';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name_fr VARCHAR(255);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS short_description_ar TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS short_description_fr TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description_fr TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS features_ar JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS features_fr JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specifications_ar JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specifications_fr JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS care_instructions TEXT[] DEFAULT ARRAY[]::text[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS care_instructions_ar TEXT[] DEFAULT ARRAY[]::text[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS care_instructions_fr TEXT[] DEFAULT ARRAY[]::text[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS size_guide JSONB DEFAULT '{"enabled": true}'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS delivery_info TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS delivery_info_ar TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS delivery_info_fr TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS return_info TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS return_info_ar TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS return_info_fr TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS trust_badges TEXT[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INT DEFAULT 20;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS min_stock INT DEFAULT 5;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_by_variant JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. FIX PRODUCTS TABLE RLS POLICIES (Allow Admin Portal to Insert/Update/Delete)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read products" ON public.products;
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert products" ON public.products;
DROP POLICY IF EXISTS "Allow auth insert products" ON public.products;
CREATE POLICY "Allow public insert products" ON public.products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update products" ON public.products;
DROP POLICY IF EXISTS "Allow auth update products" ON public.products;
CREATE POLICY "Allow public update products" ON public.products FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete products" ON public.products;
DROP POLICY IF EXISTS "Allow auth delete products" ON public.products;
CREATE POLICY "Allow public delete products" ON public.products FOR DELETE USING (true);

-- 3. AUDIT LOGS TABLE & RLS POLICIES
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id SERIAL PRIMARY KEY,
  staff_name VARCHAR(150) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target VARCHAR(255) NOT NULL,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert audit_logs" ON public.audit_logs;
CREATE POLICY "Allow public insert audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read audit_logs" ON public.audit_logs;
CREATE POLICY "Allow public read audit_logs" ON public.audit_logs FOR SELECT USING (true);

-- 4. CREATE STORAGE BUCKET 'products' & STORAGE POLICIES
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public read products images" ON storage.objects;
CREATE POLICY "Allow public read products images" ON storage.objects 
FOR SELECT USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Allow public upload products images" ON storage.objects;
CREATE POLICY "Allow public upload products images" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Allow public update products images" ON storage.objects;
CREATE POLICY "Allow public update products images" ON storage.objects 
FOR UPDATE USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Allow public delete products images" ON storage.objects;
CREATE POLICY "Allow public delete products images" ON storage.objects 
FOR DELETE USING (bucket_id = 'products');
