-- ============================================================================
-- MEDICARE — SEED FIX: Wilayas, Communes, Coupons, Staff
-- Fixed apostrophe escaping ('' instead of ') for PostgreSQL
-- ============================================================================

-- WILAYAS (all 58)
INSERT INTO public.wilayas (code, name, zone, delivery_fee_home, delivery_fee_stopdesk) VALUES
('01', '01 - Adrar', 'south', 900.00, 500.00),
('02', '02 - Chlef', 'north', 600.00, 350.00),
('03', '03 - Laghouat', 'south', 900.00, 500.00),
('04', '04 - Oum El Bouaghi', 'north', 600.00, 350.00),
('05', '05 - Batna', 'north', 600.00, 350.00),
('06', '06 - Bejaia', 'north', 600.00, 350.00),
('07', '07 - Biskra', 'south', 900.00, 500.00),
('08', '08 - Bechar', 'south', 900.00, 500.00),
('09', '09 - Blida', 'capital', 400.00, 250.00),
('10', '10 - Bouira', 'north', 600.00, 350.00),
('11', '11 - Tamanrasset', 'south', 900.00, 500.00),
('12', '12 - Tebessa', 'north', 600.00, 350.00),
('13', '13 - Tlemcen', 'north', 600.00, 350.00),
('14', '14 - Tiaret', 'north', 600.00, 350.00),
('15', '15 - Tizi Ouzou', 'north', 600.00, 350.00),
('16', '16 - Alger (العاصمة)', 'capital', 400.00, 250.00),
('17', '17 - Djelfa', 'north', 600.00, 350.00),
('18', '18 - Jijel', 'north', 600.00, 350.00),
('19', '19 - Setif', 'north', 600.00, 350.00),
('20', '20 - Saida', 'north', 600.00, 350.00),
('21', '21 - Skikda', 'north', 600.00, 350.00),
('22', '22 - Sidi Bel Abbes', 'north', 600.00, 350.00),
('23', '23 - Annaba', 'north', 600.00, 350.00),
('24', '24 - Guelma', 'north', 600.00, 350.00),
('25', '25 - Constantine', 'north', 600.00, 350.00),
('26', '26 - Medea', 'north', 600.00, 350.00),
('27', '27 - Mostaganem', 'north', 600.00, 350.00),
('28', '28 - M''Sila', 'north', 600.00, 350.00),
('29', '29 - Mascara', 'north', 600.00, 350.00),
('30', '30 - Ouargla', 'south', 900.00, 500.00),
('31', '31 - Oran', 'north', 600.00, 350.00),
('32', '32 - El Bayadh', 'south', 900.00, 500.00),
('33', '33 - Illizi', 'south', 900.00, 500.00),
('34', '34 - Bordj Bou Arreridj', 'north', 600.00, 350.00),
('35', '35 - Boumerdes', 'capital', 400.00, 250.00),
('36', '36 - El Tarf', 'north', 600.00, 350.00),
('37', '37 - Tindouf', 'south', 900.00, 500.00),
('38', '38 - Tissemsilt', 'north', 600.00, 350.00),
('39', '39 - El Oued', 'south', 900.00, 500.00),
('40', '40 - Khenchela', 'north', 600.00, 350.00),
('41', '41 - Souk Ahras', 'north', 600.00, 350.00),
('42', '42 - Tipaza', 'capital', 400.00, 250.00),
('43', '43 - Mila', 'north', 600.00, 350.00),
('44', '44 - Ain Defla', 'north', 600.00, 350.00),
('45', '45 - Naama', 'south', 900.00, 500.00),
('46', '46 - Ain Temouchent', 'north', 600.00, 350.00),
('47', '47 - Ghardaia', 'south', 900.00, 500.00),
('48', '48 - Relizane', 'north', 600.00, 350.00),
('49', '49 - El M''Ghair', 'south', 900.00, 500.00),
('50', '50 - El Meniaa', 'south', 900.00, 500.00),
('51', '51 - Ouled Djellal', 'south', 900.00, 500.00),
('52', '52 - Bordj Baji Mokhtar', 'south', 900.00, 500.00),
('53', '53 - Beni Abbes', 'south', 900.00, 500.00),
('54', '54 - Timimoun', 'south', 900.00, 500.00),
('55', '55 - Touggourt', 'south', 900.00, 500.00),
('56', '56 - Djanet', 'south', 900.00, 500.00),
('57', '57 - In Salah', 'south', 900.00, 500.00),
('58', '58 - In Guezzam', 'south', 900.00, 500.00)
ON CONFLICT (code) DO NOTHING;

-- COMMUNES (major wilayas)
INSERT INTO public.communes (wilaya_code, name) VALUES
-- Alger (16)
('16', 'El Biar'), ('16', 'Hydra'), ('16', 'Bab Ezzouar'), ('16', 'Kouba'),
('16', 'Sidi M''Hamed'), ('16', 'Zeralda'), ('16', 'Cheraga'), ('16', 'Dely Ibrahim'),
('16', 'Ain Taya'), ('16', 'Bordj El Kiffan'), ('16', 'Bachedjerrah'), ('16', 'Draria'),
-- Oran (31)
('31', 'Oran'), ('31', 'Es Senia'), ('31', 'Bir El Djir'), ('31', 'Ain El Turk'), ('31', 'Arzew'),
-- Constantine (25)
('25', 'Constantine'), ('25', 'El Khroub'), ('25', 'Hamma Bouziane'), ('25', 'Didouche Mourad'),
-- Blida (09)
('09', 'Blida'), ('09', 'Boufarik'), ('09', 'Ouled Yaich'), ('09', 'Mouzaia'),
-- Boumerdes (35)
('35', 'Boumerdes'), ('35', 'Bordj Menaiel'), ('35', 'Khemis El Khechna'),
-- Tipaza (42)
('42', 'Tipaza'), ('42', 'Cherchell'), ('42', 'Kolea'), ('42', 'Bou Ismail'),
-- Batna (05)
('05', 'Batna'), ('05', 'Barika'), ('05', 'Ain Touta'), ('05', 'N''Gaous'),
-- Setif (19)
('19', 'Setif'), ('19', 'El Eulma'), ('19', 'Ain Oulmene'), ('19', 'Ain Arnat'),
-- Annaba (23)
('23', 'Annaba'), ('23', 'El Bouni'), ('23', 'Berrahal'), ('23', 'El Hadjar'),
-- Tizi Ouzou (15)
('15', 'Tizi Ouzou'), ('15', 'Draa Ben Khedda'), ('15', 'Azazga'), ('15', 'Boghni'),
-- Bejaia (06)
('06', 'Bejaia'), ('06', 'Amizour'), ('06', 'Akbou'), ('06', 'El Kseur'),
-- Tlemcen (13)
('13', 'Tlemcen'), ('13', 'Mansourah'), ('13', 'Maghnia'), ('13', 'Ghazaouet'),
-- Skikda (21)
('21', 'Skikda'), ('21', 'El Harrouch'), ('21', 'Collo'), ('21', 'Azzaba'),
-- Guelma (24)
('24', 'Guelma'), ('24', 'Oued Zenati'), ('24', 'Bouchegouf'),
-- M''Sila (28)
('28', 'M''Sila'), ('28', 'Bou Saada'), ('28', 'Sidi Aissa'),
-- Biskra (07)
('07', 'Biskra'), ('07', 'Tolga'), ('07', 'Sidi Okba'),
-- Ouargla (30)
('30', 'Ouargla'), ('30', 'Hassi Messaoud'), ('30', 'Touggourt'),
-- Ghardaia (47)
('47', 'Ghardaia'), ('47', 'Metlili'), ('47', 'El Guerrara'),
-- Adrar (01)
('01', 'Adrar'), ('01', 'Reggane'), ('01', 'Timimoun'),
-- Tamanrasset (11)
('11', 'Tamanrasset'), ('11', 'In Salah'), ('11', 'In Guezzam')
ON CONFLICT DO NOTHING;

-- COUPONS
INSERT INTO public.coupons (code, discount_type, value, usage_limit, times_used, active) VALUES
('STUDENT10', 'percentage', 10.00, 500, 142, true),
('MEDICARE2026', 'fixed', 2000.00, 200, 89, true),
('NURSE15', 'percentage', 15.00, 300, 55, true),
('PHARMA20', 'percentage', 20.00, 200, 23, true)
ON CONFLICT (code) DO NOTHING;

-- STAFF (role/permissions only — auth is handled by Supabase Auth separately)
INSERT INTO public.staff (name, email, role, permissions, is_active) VALUES
('Dr. Karim Owner',    'owner@medicare.dz',   'Owner',           '["all"]'::jsonb,                                                                           true),
('Youcef Manager',     'manager@medicare.dz', 'Store Manager',   '["products","inventory","categories","coupons","homepage","reports"]'::jsonb,               true),
('Farid Order Handler','handler@medicare.dz', 'Order Handler',   '["orders","customers","reviews"]'::jsonb,                                                   true),
('Sara Support',       'support@medicare.dz', 'Support & Content','["reviews","homepage"]'::jsonb,                                                            true)
ON CONFLICT (email) DO NOTHING;

-- CATEGORIES
INSERT INTO public.categories (id, name, name_ar, specialty) VALUES
('CAT-01', 'Scrubs & Clinical Wear',  'سكراب وملابس سريرية',  'medicine'),
('CAT-02', 'Lab Coats',               'معاطف المختبر',         'pharmacy'),
('CAT-03', 'Footwear',                'الأحذية الطبية',        'nursing'),
('CAT-04', 'Diagnostic Equipment',    'أجهزة التشخيص',         'medicine'),
('CAT-05', 'Medical Bags',            'الحقائب الطبية',        'medicine'),
('CAT-06', 'Starter Kits & Bundles',  'حقائب الطلاب والأطباء', 'medicine')
ON CONFLICT (id) DO NOTHING;
