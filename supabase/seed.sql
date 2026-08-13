-- ============================================================================
-- MEDICARE E-COMMERCE PLATFORM — SUPABASE SEED DATA SCRIPT
-- Populates 32 products, 58 Wilayas + Communes, Coupons, Staff roles, and Reviews
-- ============================================================================

-- 1. SEED WILAYAS
INSERT INTO public.wilayas (code, name, zone, delivery_fee_home, delivery_fee_stopdesk) VALUES
('01', '01 - Adrar', 'south', 900.00, 500.00),
('02', '02 - Chlef', 'north', 600.00, 350.00),
('03', '03 - Laghouat', 'south', 900.00, 500.00),
('04', '04 - Oum El Bouaghi', 'north', 600.00, 350.00),
('05', '05 - Batna', 'north', 600.00, 350.00),
('06', '06 - Béjaïa', 'north', 600.00, 350.00),
('07', '07 - Biskra', 'south', 900.00, 500.00),
('08', '08 - Béchar', 'south', 900.00, 500.00),
('09', '09 - Blida', 'capital', 400.00, 250.00),
('10', '10 - Bouira', 'north', 600.00, 350.00),
('11', '11 - Tamanrasset', 'south', 900.00, 500.00),
('12', '12 - Tébessa', 'north', 600.00, 350.00),
('13', '13 - Tlemcen', 'north', 600.00, 350.00),
('14', '14 - Tiaret', 'north', 600.00, 350.00),
('15', '15 - Tizi Ouzou', 'north', 600.00, 350.00),
('16', '16 - Alger (العاصمة)', 'capital', 400.00, 250.00),
('17', '17 - Djelfa', 'north', 600.00, 350.00),
('18', '18 - Jijel', 'north', 600.00, 350.00),
('19', '19 - Sétif', 'north', 600.00, 350.00),
('20', '20 - Saïda', 'north', 600.00, 350.00),
('21', '21 - Skikda', 'north', 600.00, 350.00),
('22', '22 - Sidi Bel Abbès', 'north', 600.00, 350.00),
('23', '23 - Annaba', 'north', 600.00, 350.00),
('24', '24 - Guelma', 'north', 600.00, 350.00),
('25', '25 - Constantine', 'north', 600.00, 350.00),
('26', '26 - Médéa', 'north', 600.00, 350.00),
('27', '27 - Mostaganem', 'north', 600.00, 350.00),
('28', '28 - M’Sila', 'north', 600.00, 350.00),
('29', '29 - Mascara', 'north', 600.00, 350.00),
('30', '30 - Ouargla', 'south', 900.00, 500.00),
('31', '31 - Oran (وهران)', 'north', 600.00, 350.00),
('32', '32 - El Bayadh', 'south', 900.00, 500.00),
('33', '33 - Illizi', 'south', 900.00, 500.00),
('34', '34 - Bordj Bou Arréridj', 'north', 600.00, 350.00),
('35', '35 - Boumerdès', 'capital', 400.00, 250.00),
('36', '36 - El Tarf', 'north', 600.00, 350.00),
('37', '37 - Tindouf', 'south', 900.00, 500.00),
('38', '38 - Tissemsilt', 'north', 600.00, 350.00),
('39', '39 - El Oued', 'south', 900.00, 500.00),
('40', '40 - Khenchela', 'north', 600.00, 350.00),
('41', '41 - Souk Ahras', 'north', 600.00, 350.00),
('42', '42 - Tipaza', 'capital', 400.00, 250.00),
('43', '43 - Mila', 'north', 600.00, 350.00),
('44', '44 - Aïn Defla', 'north', 600.00, 350.00),
('45', '45 - Naâma', 'south', 900.00, 500.00),
('46', '46 - Aïn Témouchent', 'north', 600.00, 350.00),
('47', '47 - Ghardaïa', 'south', 900.00, 500.00),
('48', '48 - Relizane', 'north', 600.00, 350.00),
('49', '49 - El M’Ghair', 'south', 900.00, 500.00),
('50', '50 - El Meniaa', 'south', 900.00, 500.00),
('51', '51 - Ouled Djellal', 'south', 900.00, 500.00),
('52', '52 - Bordj Baji Mokhtar', 'south', 900.00, 500.00),
('53', '53 - Béni Abbès', 'south', 900.00, 500.00),
('54', '54 - Timimoun', 'south', 900.00, 500.00),
('55', '55 - Touggourt', 'south', 900.00, 500.00),
('56', '56 - Djanet', 'south', 900.00, 500.00),
('57', '57 - In Salah', 'south', 900.00, 500.00),
('58', '58 - In Guezzam', 'south', 900.00, 500.00)
ON CONFLICT (code) DO NOTHING;

-- 2. SEED COMMUNES FOR ALGIERS (16)
INSERT INTO public.communes (wilaya_code, name) VALUES
('16', 'El Biar'), ('16', 'Hydra'), ('16', 'Bab Ezzouar'), ('16', 'Kouba'), ('16', 'Sidi M’Hamed'), ('16', 'Zeralda'), ('16', 'Cheraga'), ('16', 'Dely Ibrahim');

-- 3. SEED PRODUCTS
INSERT INTO public.products (id, name, name_ar, specialty, price, original_price, rating, reviews_count, material, brand, badge, colors, sizes, images, is_new, is_bestseller, stock) VALUES
('MC-101', 'Obsidian Flex Antimicrobial Scrub Set', 'طقم سكراب أوبسيديان المضاد للبكتيريا', 'medicine', 10700, 13400, 4.8, 142, 'antimicrobial', 'medicare', 'sale', ARRAY['#0E4D45','#1E3A5F','#6B7280'], ARRAY['XS','S','M','L','XL','XXL'], ARRAY['assets/medicare_scrubs_hero_1786614154492.png','assets/medicare_lab_coat_1786614177321.png'], false, true, 12),
('MC-102', 'ClinFlex 4-Way Stretch Scrub Pants', 'بنطلون سكراب مرن بـ 4 اتجاهات', 'nursing', 6800, NULL, 4.7, 98, 'flex', 'clinflex', 'new', ARRAY['#0F766E','#7C3AED','#1D4ED8'], ARRAY['S','M','L','XL'], ARRAY['assets/medicare_lab_coat_1786614177321.png','assets/medicare_scrubs_hero_1786614154492.png'], true, false, 28),
('MC-103', 'Executive Fluid-Shield Lab Coat', 'معطف مختبر مقاوم للسوائل', 'pharmacy', 13400, 16700, 4.9, 211, 'fluid-shield', 'medicare', 'hot', ARRAY['#F8F8F8','#1E3A5F'], ARRAY['S','M','L','XL','XXL'], ARRAY['assets/medicare_lab_coat_1786614177321.png','assets/medicare_scrubs_hero_1786614154492.png'], false, true, 58),
('MC-108', 'Titanium Master Diagnostic Stethoscope', 'سماعة تيتانيوم الدقيقة', 'medicine', 19800, 24000, 5.0, 317, 'antimicrobial', 'medicare', 'hot', ARRAY['#0E4D45','#1E3A5F','#6B7280'], ARRAY['ONE'], ARRAY['assets/medicare_stethoscope_1786614166370.png','assets/medicare_medical_bag_1786614187700.png'], false, true, 9),
('MC-110', 'Clinical Cushion Antibacterial Clogs', 'قبقاب طبي بمقدمة مغلقة', 'nursing', 9000, 11300, 4.5, 128, 'antimicrobial', 'medicare', 'sale', ARRAY['#0E4D45','#F8F8F8','#1E3A5F'], ARRAY['37','38','39','40','41','42','43','44','45'], ARRAY['assets/medicare_footwear_1786615096505.png'], false, true, 15),
('MC-112', '1st Year Pharmacy Starter Kit', 'حقيبة الصيدلة — السنة الأولى', 'pharmacy', 17400, 23400, 4.9, 183, 'antimicrobial', 'medicare', 'bundle', ARRAY['#0E4D45'], ARRAY['ONE'], ARRAY['assets/medicare_starter_kit_1786615195273.png'], false, true, 5)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED COUPONS
INSERT INTO public.coupons (code, discount_type, value, usage_limit, times_used, active) VALUES
('STUDENT10', 'percentage', 10.00, 500, 142, true),
('MEDICARE2026', 'fixed', 2000.00, 200, 89, true)
ON CONFLICT (code) DO NOTHING;

-- 5. SEED STAFF ROLES
INSERT INTO public.staff (name, email, role, permissions, is_active) VALUES
('Dr. Karim Owner', 'owner@medicare.dz', 'Owner', '["all"]'::jsonb, true),
('Youcef Manager', 'manager@medicare.dz', 'Store Manager', '["products","inventory","categories","coupons","homepage","reports"]'::jsonb, true),
('Farid Order Handler', 'handler@medicare.dz', 'Order Handler', '["orders","customers","reviews"]'::jsonb, true),
('Sara Support', 'support@medicare.dz', 'Support & Content', '["reviews","homepage"]'::jsonb, true)
ON CONFLICT (email) DO NOTHING;
