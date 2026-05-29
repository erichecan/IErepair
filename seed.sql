-- IERepair Platform — Seed Data for 3-End Closed Loop Demo
--
-- Prerequisites:
--   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
--   CREATE EXTENSION IF NOT EXISTS "postgis";
--
-- Run: psql $DATABASE_URL -f seed.sql
-- All prices in Irish Euro cents (€ × 100)
-- Passwords: Admin/Merchant/Supplier → "Password123!"

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================
-- 1. ADMIN USERS
-- ============================================================
INSERT INTO admin_users (id, email, full_name, role, password_hash, is_active)
VALUES (
    '00000000-0000-0000-0000-100000000001',
    'admin@ierepair.ie',
    'Platform Admin',
    'super_admin',
    crypt('Password123!', gen_salt('bf', 10)),
    true
)
ON CONFLICT (email) DO UPDATE SET
    full_name    = EXCLUDED.full_name,
    role         = EXCLUDED.role,
    is_active    = EXCLUDED.is_active,
    updated_at   = NOW();

-- ============================================================
-- 2. SUPPLIERS
-- ============================================================
INSERT INTO suppliers (id, company_name, contact_name, email, phone, address, password_hash, status)
VALUES (
    '00000000-0000-0000-0000-200000000001',
    'TechSupply Ireland Ltd',
    'David Chen',
    'supplier@techsupply.ie',
    '+35314561234',
    'Unit 5, Sandyford Industrial Estate, Dublin 18, D18 K7T3',
    crypt('Password123!', gen_salt('bf', 10)),
    'active'
)
ON CONFLICT (email) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    status       = EXCLUDED.status,
    updated_at   = NOW();

-- ============================================================
-- 3. PRODUCT CATEGORIES (whitelist tree)
-- ============================================================
INSERT INTO product_categories (id, parent_id, name, slug, sort_order) VALUES
    ('00000000-0000-0000-0000-300000000001', NULL,
     'Phone Accessories', 'phone-accessories', 0)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, updated_at = NOW();

INSERT INTO product_categories (id, parent_id, name, slug, sort_order) VALUES
    ('00000000-0000-0000-0000-300000000002', '00000000-0000-0000-0000-300000000001',
     'Phone Cases', 'phone-cases', 1),
    ('00000000-0000-0000-0000-300000000003', '00000000-0000-0000-0000-300000000001',
     'Screen Protectors', 'screen-protectors', 2),
    ('00000000-0000-0000-0000-300000000004', '00000000-0000-0000-0000-300000000001',
     'Chargers & Cables', 'chargers-cables', 3),
    ('00000000-0000-0000-0000-300000000005', '00000000-0000-0000-0000-300000000001',
     'Power Banks', 'power-banks', 4),
    ('00000000-0000-0000-0000-300000000006', '00000000-0000-0000-0000-300000000001',
     'Earphones & Audio', 'earphones-audio', 5),
    ('00000000-0000-0000-0000-300000000007', '00000000-0000-0000-0000-300000000001',
     'Stands & Mounts', 'stands-mounts', 6)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, parent_id = EXCLUDED.parent_id,
    sort_order = EXCLUDED.sort_order, updated_at = NOW();

-- ============================================================
-- 4. REPAIR SERVICES (7 services)
-- ============================================================
INSERT INTO repair_services (id, name, compatible_brands, description, is_active) VALUES
    ('00000000-0000-0000-0000-400000000001',
     'Screen Replacement', '["Apple"]',
     'iPhone screen replacement with OEM-quality display', true),
    ('00000000-0000-0000-0000-400000000002',
     'Screen Replacement', '["Samsung"]',
     'Samsung Galaxy AMOLED screen replacement', true),
    ('00000000-0000-0000-0000-400000000003',
     'Battery Replacement', '["Apple"]',
     'iPhone battery replacement, restores original capacity', true),
    ('00000000-0000-0000-0000-400000000004',
     'Battery Replacement', '["Samsung"]',
     'Samsung battery replacement service', true),
    ('00000000-0000-0000-0000-400000000005',
     'Charging Port Repair', '["Apple","Samsung","Google","OnePlus"]',
     'Fix faulty Lightning or USB-C charging ports', true),
    ('00000000-0000-0000-0000-400000000006',
     'Camera Repair', '["Apple","Samsung"]',
     'Front or rear camera module replacement', true),
    ('00000000-0000-0000-0000-400000000007',
     'Water Damage Treatment', '["Apple","Samsung","Google"]',
     'Ultrasonic cleaning and corrosion treatment', true)
ON CONFLICT (id) DO UPDATE SET
    name              = EXCLUDED.name,
    compatible_brands = EXCLUDED.compatible_brands,
    is_active         = EXCLUDED.is_active,
    updated_at        = NOW();

-- ============================================================
-- 5. MERCHANTS (3 Dublin stores)
-- ============================================================
INSERT INTO merchants (
    id, owner_name, shop_name, email, phone,
    address_line1, city, eircode, location,
    description, status, password_hash, approved_at, approved_by
) VALUES
(
    '00000000-0000-0000-0000-500000000001',
    'Liam Byrne', 'iFixit Dublin City Centre',
    'citycenter@ifix.ie', '+35316781234',
    '15 Abbey Street Lower', 'Dublin', 'D01 P2V6',
    ST_GeographyFromText('SRID=4326;POINT(-6.2601 53.3478)'),
    'City centre phone repair and accessories. Walk-ins welcome.',
    'active', crypt('Password123!', gen_salt('bf', 10)),
    NOW() - INTERVAL '30 days', '00000000-0000-0000-0000-100000000001'
),
(
    '00000000-0000-0000-0000-500000000002',
    'Sinéad Gallagher', 'iFixit Rathmines',
    'rathmines@ifix.ie', '+35314971234',
    '44 Rathmines Road Lower', 'Dublin', 'D06 T2C4',
    ST_GeographyFromText('SRID=4326;POINT(-6.2633 53.3241)'),
    'Serving Rathmines, Ranelagh and surrounding areas.',
    'active', crypt('Password123!', gen_salt('bf', 10)),
    NOW() - INTERVAL '20 days', '00000000-0000-0000-0000-100000000001'
),
(
    '00000000-0000-0000-0000-500000000003',
    'Pádraig Ó Murchú', 'iFixit Swords',
    'swords@ifix.ie', '+35318971234',
    '22 Main Street', 'Swords', 'K67 X8Y1',
    ST_GeographyFromText('SRID=4326;POINT(-6.2181 53.4597)'),
    'North County Dublin''s trusted phone repair shop.',
    'active', crypt('Password123!', gen_salt('bf', 10)),
    NOW() - INTERVAL '15 days', '00000000-0000-0000-0000-100000000001'
)
ON CONFLICT (email) DO UPDATE SET
    shop_name  = EXCLUDED.shop_name,
    status     = EXCLUDED.status,
    location   = EXCLUDED.location,
    updated_at = NOW();

-- ============================================================
-- 6. MERCHANT HOURS (7 days × 3 stores)
-- day_of_week: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
-- ============================================================
DELETE FROM merchant_hours WHERE merchant_id IN (
    '00000000-0000-0000-0000-500000000001',
    '00000000-0000-0000-0000-500000000002',
    '00000000-0000-0000-0000-500000000003'
);

-- City Centre: Mon-Fri 09:00-18:00, Sat 10:00-18:00, Sun 11:00-17:00
INSERT INTO merchant_hours (id, merchant_id, day_of_week, open_time, close_time, is_closed) VALUES
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001',0,'11:00','17:00',false),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001',1,'09:00','18:00',false),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001',2,'09:00','18:00',false),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001',3,'09:00','18:00',false),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001',4,'09:00','18:00',false),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001',5,'09:00','19:00',false),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001',6,'10:00','18:00',false);

-- Rathmines: Mon-Fri 09:30-18:00, Sat 10:00-17:00, Sun closed
INSERT INTO merchant_hours (id, merchant_id, day_of_week, open_time, close_time, is_closed) VALUES
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000002',0,NULL,NULL,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000002',1,'09:30','18:00',false),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000002',2,'09:30','18:00',false),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000002',3,'09:30','18:00',false),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000002',4,'09:30','18:00',false),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000002',5,'09:30','18:00',false),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000002',6,'10:00','17:00',false);

-- Swords: Mon-Sat 09:00-17:30, Sun 12:00-16:00
INSERT INTO merchant_hours (id, merchant_id, day_of_week, open_time, close_time, is_closed) VALUES
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000003',0,'12:00','16:00',false),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000003',1,'09:00','17:30',false),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000003',2,'09:00','17:30',false),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000003',3,'09:00','17:30',false),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000003',4,'09:00','17:30',false),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000003',5,'09:00','17:30',false),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000003',6,'10:00','17:00',false);

-- ============================================================
-- 7. PRODUCTS (15 products, approved)
-- ============================================================
INSERT INTO products (
    id, supplier_id, category_id, name, brand,
    description, images, compatible_models,
    status, reviewed_by, reviewed_at
) VALUES

-- Phone Cases
('00000000-0000-0000-0000-600000000001',
 '00000000-0000-0000-0000-200000000001',
 '00000000-0000-0000-0000-300000000002',
 'iPhone 15 Pro Clear Case','GenX',
 'Ultra-thin TPU clear case. Military-grade drop protection, yellowing-resistant.',
 '["https://cdn.ierepair.ie/products/iphone15pro-clear-1.jpg"]',
 '["iPhone 15 Pro"]',
 'active','00000000-0000-0000-0000-100000000001', NOW()-INTERVAL '25 days'),

('00000000-0000-0000-0000-600000000002',
 '00000000-0000-0000-0000-200000000001',
 '00000000-0000-0000-0000-300000000002',
 'iPhone 15 Pro Silicone Case','GenX',
 'Premium liquid silicone with microfibre inner lining.',
 '["https://cdn.ierepair.ie/products/iphone15pro-silicone-1.jpg"]',
 '["iPhone 15 Pro"]',
 'active','00000000-0000-0000-0000-100000000001', NOW()-INTERVAL '25 days'),

('00000000-0000-0000-0000-600000000003',
 '00000000-0000-0000-0000-200000000001',
 '00000000-0000-0000-0000-300000000002',
 'Samsung Galaxy S24 Slim Case','ArmorShield',
 'Thin protective case with raised edges for screen and camera.',
 '["https://cdn.ierepair.ie/products/samsung-s24-slim-1.jpg"]',
 '["Samsung Galaxy S24"]',
 'active','00000000-0000-0000-0000-100000000001', NOW()-INTERVAL '22 days'),

-- Screen Protectors
('00000000-0000-0000-0000-600000000004',
 '00000000-0000-0000-0000-200000000001',
 '00000000-0000-0000-0000-300000000003',
 'iPhone 15 Tempered Glass Screen Protector','ShieldPro',
 '9H hardness tempered glass. Includes dust removal kit.',
 '["https://cdn.ierepair.ie/products/iphone15-glass-1.jpg"]',
 '["iPhone 15","iPhone 15 Plus","iPhone 15 Pro","iPhone 15 Pro Max"]',
 'active','00000000-0000-0000-0000-100000000001', NOW()-INTERVAL '22 days'),

('00000000-0000-0000-0000-600000000005',
 '00000000-0000-0000-0000-200000000001',
 '00000000-0000-0000-0000-300000000003',
 'Samsung Galaxy S24 Tempered Glass Screen Protector','ShieldPro',
 'Curved-edge tempered glass, fingerprint sensor compatible.',
 '["https://cdn.ierepair.ie/products/samsung-s24-glass-1.jpg"]',
 '["Samsung Galaxy S24"]',
 'active','00000000-0000-0000-0000-100000000001', NOW()-INTERVAL '22 days'),

-- Chargers & Cables
('00000000-0000-0000-0000-600000000006',
 '00000000-0000-0000-0000-200000000001',
 '00000000-0000-0000-0000-300000000004',
 'USB-C to Lightning Cable 1m','SnapLink',
 'MFi-certified. Fast-charges up to 18W. Nylon braided.',
 '["https://cdn.ierepair.ie/products/usbc-lightning-1.jpg"]',
 '["iPhone 14","iPhone 14 Pro","iPhone 13"]',
 'active','00000000-0000-0000-0000-100000000001', NOW()-INTERVAL '20 days'),

('00000000-0000-0000-0000-600000000007',
 '00000000-0000-0000-0000-200000000001',
 '00000000-0000-0000-0000-300000000004',
 'USB-C to USB-C Cable 2m Braided','SnapLink',
 '100W USB-C to USB-C fast charge. 2m braided nylon.',
 '["https://cdn.ierepair.ie/products/usbc-usbc-2m-1.jpg"]',
 '["iPhone 15","iPhone 15 Pro","Samsung Galaxy S24","MacBook Air"]',
 'active','00000000-0000-0000-0000-100000000001', NOW()-INTERVAL '20 days'),

('00000000-0000-0000-0000-600000000008',
 '00000000-0000-0000-0000-200000000001',
 '00000000-0000-0000-0000-300000000004',
 '20W USB-C Fast Charger Plug','SnapLink',
 'Compact 20W USB-C charger. Irish plug. Compatible with iPhone 15 and Android.',
 '["https://cdn.ierepair.ie/products/20w-charger-1.jpg"]',
 '["iPhone 15","iPhone 14","Samsung Galaxy S24","iPad"]',
 'active','00000000-0000-0000-0000-100000000001', NOW()-INTERVAL '20 days'),

-- Power Banks
('00000000-0000-0000-0000-600000000009',
 '00000000-0000-0000-0000-200000000001',
 '00000000-0000-0000-0000-300000000005',
 'PowerCore 10000mAh Compact Power Bank','SnapLink',
 '10,000mAh slim power bank. USB-C + dual USB-A. Charges iPhone 15 twice.',
 '["https://cdn.ierepair.ie/products/powerbank-10k-1.jpg"]',
 '["iPhone 15","Samsung Galaxy S24","Universal"]',
 'active','00000000-0000-0000-0000-100000000001', NOW()-INTERVAL '18 days'),

('00000000-0000-0000-0000-600000000010',
 '00000000-0000-0000-0000-200000000001',
 '00000000-0000-0000-0000-300000000005',
 'PowerCore 20000mAh Slim Power Bank','SnapLink',
 '20,000mAh high-capacity. 22.5W fast charge. Ultra-slim design.',
 '["https://cdn.ierepair.ie/products/powerbank-20k-1.jpg"]',
 '["Universal"]',
 'active','00000000-0000-0000-0000-100000000001', NOW()-INTERVAL '18 days'),

-- Earphones & Audio
('00000000-0000-0000-0000-600000000011',
 '00000000-0000-0000-0000-200000000001',
 '00000000-0000-0000-0000-300000000006',
 'ProBuds Wireless Earbuds TWS','SoundFit',
 'True wireless. 30hr battery with case. IPX5 waterproof. Bluetooth 5.3.',
 '["https://cdn.ierepair.ie/products/probuds-1.jpg"]',
 '["Universal"]',
 'active','00000000-0000-0000-0000-100000000001', NOW()-INTERVAL '15 days'),

('00000000-0000-0000-0000-600000000012',
 '00000000-0000-0000-0000-200000000001',
 '00000000-0000-0000-0000-300000000006',
 'USB-C Wired Earphones','SoundFit',
 'Hi-fi USB-C earphones. 10mm driver. In-line mic and volume control.',
 '["https://cdn.ierepair.ie/products/usbc-earphones-1.jpg"]',
 '["iPhone 15","Samsung Galaxy S24","Universal USB-C"]',
 'active','00000000-0000-0000-0000-100000000001', NOW()-INTERVAL '15 days'),

-- MagSafe Wallet (Cases category)
('00000000-0000-0000-0000-600000000013',
 '00000000-0000-0000-0000-200000000001',
 '00000000-0000-0000-0000-300000000002',
 'MagSafe Card Wallet','GenX',
 'Genuine leather magnetic card wallet. Holds 3 cards. MagSafe compatible.',
 '["https://cdn.ierepair.ie/products/magsafe-wallet-1.jpg"]',
 '["iPhone 12","iPhone 13","iPhone 14","iPhone 15","iPhone 15 Pro"]',
 'active','00000000-0000-0000-0000-100000000001', NOW()-INTERVAL '12 days'),

-- Stands & Mounts
('00000000-0000-0000-0000-600000000014',
 '00000000-0000-0000-0000-200000000001',
 '00000000-0000-0000-0000-300000000007',
 'Universal Adjustable Phone Stand','DeskMate',
 'Aluminium adjustable stand. Foldable and portable. Fits all phones.',
 '["https://cdn.ierepair.ie/products/phone-stand-1.jpg"]',
 '["Universal"]',
 'active','00000000-0000-0000-0000-100000000001', NOW()-INTERVAL '10 days'),

('00000000-0000-0000-0000-600000000015',
 '00000000-0000-0000-0000-200000000001',
 '00000000-0000-0000-0000-300000000007',
 'Car Phone Mount Vent Clip','DeskMate',
 'Universal air vent car mount. One-hand operation. 360° rotation.',
 '["https://cdn.ierepair.ie/products/car-mount-1.jpg"]',
 '["Universal"]',
 'active','00000000-0000-0000-0000-100000000001', NOW()-INTERVAL '10 days')

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, status = EXCLUDED.status, updated_at = NOW();

-- ============================================================
-- 8. PRODUCT SKUs (25 SKUs for 15 products)
-- wholesale / min_retail / suggest_retail all in cents
-- ============================================================
INSERT INTO product_skus (id, product_id, sku_code, attributes,
    wholesale_price_cents, min_retail_price_cents, suggest_retail_price_cents, stock_quantity) VALUES

-- Product 1: iPhone 15 Pro Clear Case
('00000000-0000-0000-0000-700000000001','00000000-0000-0000-0000-600000000001',
 'GX-IP15P-CLR-CLEAR','{"color":"Crystal Clear"}', 500,999,1499,150),
('00000000-0000-0000-0000-700000000002','00000000-0000-0000-0000-600000000001',
 'GX-IP15P-CLR-MBLK','{"color":"Matte Black"}', 500,999,1499,120),

-- Product 2: iPhone 15 Pro Silicone Case
('00000000-0000-0000-0000-700000000003','00000000-0000-0000-0000-600000000002',
 'GX-IP15P-SLC-MNT','{"color":"Midnight"}', 800,1500,2499,80),
('00000000-0000-0000-0000-700000000004','00000000-0000-0000-0000-600000000002',
 'GX-IP15P-SLC-PINK','{"color":"Light Pink"}', 800,1500,2499,80),

-- Product 3: Samsung S24 Slim Case
('00000000-0000-0000-0000-700000000005','00000000-0000-0000-0000-600000000003',
 'AS-S24-SLIM-BLK','{"color":"Black"}', 600,1100,1999,100),
('00000000-0000-0000-0000-700000000006','00000000-0000-0000-0000-600000000003',
 'AS-S24-SLIM-CLR','{"color":"Clear"}', 600,1100,1999,100),

-- Product 4: iPhone 15 Screen Protector
('00000000-0000-0000-0000-700000000007','00000000-0000-0000-0000-600000000004',
 'SP-IP15-STD','{"type":"Standard"}', 400,799,1299,200),
('00000000-0000-0000-0000-700000000008','00000000-0000-0000-0000-600000000004',
 'SP-IP15-PRV','{"type":"Privacy"}', 550,999,1699,120),

-- Product 5: Samsung S24 Screen Protector
('00000000-0000-0000-0000-700000000009','00000000-0000-0000-0000-600000000005',
 'SP-S24-STD','{"type":"Standard"}', 400,799,1299,200),

-- Product 6: USB-C to Lightning Cable
('00000000-0000-0000-0000-700000000010','00000000-0000-0000-0000-600000000006',
 'SL-USBC-LTN-WHT','{"color":"White","length":"1m"}', 500,999,1499,300),
('00000000-0000-0000-0000-700000000011','00000000-0000-0000-0000-600000000006',
 'SL-USBC-LTN-BLK','{"color":"Space Black","length":"1m"}', 500,999,1499,200),

-- Product 7: USB-C to USB-C Cable 2m
('00000000-0000-0000-0000-700000000012','00000000-0000-0000-0000-600000000007',
 'SL-USBC-USBC-2M','{"color":"Midnight Blue","length":"2m"}', 700,1299,1999,250),

-- Product 8: 20W Fast Charger
('00000000-0000-0000-0000-700000000013','00000000-0000-0000-0000-600000000008',
 'SL-CHG20W-WHT','{"color":"White","wattage":"20W"}', 900,1699,2499,180),
('00000000-0000-0000-0000-700000000014','00000000-0000-0000-0000-600000000008',
 'SL-CHG20W-BLK','{"color":"Black","wattage":"20W"}', 900,1699,2499,180),

-- Product 9: 10000mAh Power Bank
('00000000-0000-0000-0000-700000000015','00000000-0000-0000-0000-600000000009',
 'SL-PB10K-BLK','{"color":"Black","capacity":"10000mAh"}', 1800,2999,4499,80),
('00000000-0000-0000-0000-700000000016','00000000-0000-0000-0000-600000000009',
 'SL-PB10K-WHT','{"color":"White","capacity":"10000mAh"}', 1800,2999,4499,60),

-- Product 10: 20000mAh Power Bank
('00000000-0000-0000-0000-700000000017','00000000-0000-0000-0000-600000000010',
 'SL-PB20K-BLK','{"color":"Black","capacity":"20000mAh"}', 2500,3999,5999,50),

-- Product 11: Wireless Earbuds
('00000000-0000-0000-0000-700000000018','00000000-0000-0000-0000-600000000011',
 'SF-BUDS-WHT','{"color":"White"}', 2000,3500,4999,60),
('00000000-0000-0000-0000-700000000019','00000000-0000-0000-0000-600000000011',
 'SF-BUDS-BLK','{"color":"Black"}', 2000,3500,4999,60),

-- Product 12: USB-C Wired Earphones
('00000000-0000-0000-0000-700000000020','00000000-0000-0000-0000-600000000012',
 'SF-EARPH-WHT','{"color":"White"}', 800,1499,2299,100),

-- Product 13: MagSafe Card Wallet
('00000000-0000-0000-0000-700000000021','00000000-0000-0000-0000-600000000013',
 'GX-MGSF-WALL-BLK','{"color":"Black"}', 1200,1999,3499,80),
('00000000-0000-0000-0000-700000000022','00000000-0000-0000-0000-600000000013',
 'GX-MGSF-WALL-TAN','{"color":"Tan"}', 1200,1999,3499,70),

-- Product 14: Universal Phone Stand
('00000000-0000-0000-0000-700000000023','00000000-0000-0000-0000-600000000014',
 'DM-STAND-SLV','{"color":"Silver","material":"Aluminium"}', 1000,1799,2799,100),
('00000000-0000-0000-0000-700000000024','00000000-0000-0000-0000-600000000014',
 'DM-STAND-BLK','{"color":"Black","material":"Aluminium"}', 1000,1799,2799,100),

-- Product 15: Car Phone Mount
('00000000-0000-0000-0000-700000000025','00000000-0000-0000-0000-600000000015',
 'DM-CARMNT-BLK','{"color":"Black"}', 700,1199,1999,150)

ON CONFLICT (id) DO UPDATE SET
    wholesale_price_cents     = EXCLUDED.wholesale_price_cents,
    min_retail_price_cents    = EXCLUDED.min_retail_price_cents,
    suggest_retail_price_cents= EXCLUDED.suggest_retail_price_cents,
    updated_at = NOW();

-- ============================================================
-- 9. MERCHANT PRODUCTS (what each store stocks + their prices)
-- ============================================================

-- City Centre: iPhone premium focus (14 rows)
INSERT INTO merchant_products (id, merchant_id, sku_id, price_cents, is_active) VALUES
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001','00000000-0000-0000-0000-700000000001',1499,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001','00000000-0000-0000-0000-700000000002',1499,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001','00000000-0000-0000-0000-700000000003',2499,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001','00000000-0000-0000-0000-700000000004',2499,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001','00000000-0000-0000-0000-700000000007',1299,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001','00000000-0000-0000-0000-700000000008',1699,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001','00000000-0000-0000-0000-700000000013',2499,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001','00000000-0000-0000-0000-700000000014',2499,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001','00000000-0000-0000-0000-700000000015',4499,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001','00000000-0000-0000-0000-700000000016',4499,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001','00000000-0000-0000-0000-700000000021',3499,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001','00000000-0000-0000-0000-700000000022',3499,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001','00000000-0000-0000-0000-700000000023',2799,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001','00000000-0000-0000-0000-700000000024',2799,true)
ON CONFLICT (merchant_id, sku_id) DO UPDATE SET
    price_cents = EXCLUDED.price_cents, is_active = EXCLUDED.is_active, updated_at = NOW();

-- Rathmines: Samsung + accessories focus (11 rows)
INSERT INTO merchant_products (id, merchant_id, sku_id, price_cents, is_active) VALUES
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000002','00000000-0000-0000-0000-700000000005',1899,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000002','00000000-0000-0000-0000-700000000006',1899,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000002','00000000-0000-0000-0000-700000000009',1299,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000002','00000000-0000-0000-0000-700000000010',1299,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000002','00000000-0000-0000-0000-700000000011',1299,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000002','00000000-0000-0000-0000-700000000012',1899,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000002','00000000-0000-0000-0000-700000000013',2299,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000002','00000000-0000-0000-0000-700000000017',5499,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000002','00000000-0000-0000-0000-700000000018',4999,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000002','00000000-0000-0000-0000-700000000019',4999,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000002','00000000-0000-0000-0000-700000000025',1799,true)
ON CONFLICT (merchant_id, sku_id) DO UPDATE SET
    price_cents = EXCLUDED.price_cents, is_active = EXCLUDED.is_active, updated_at = NOW();

-- Swords: Budget-friendly broad selection (9 rows)
INSERT INTO merchant_products (id, merchant_id, sku_id, price_cents, is_active) VALUES
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000003','00000000-0000-0000-0000-700000000001',1199,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000003','00000000-0000-0000-0000-700000000005',1599,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000003','00000000-0000-0000-0000-700000000007',999,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000003','00000000-0000-0000-0000-700000000010',1099,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000003','00000000-0000-0000-0000-700000000011',1099,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000003','00000000-0000-0000-0000-700000000014',1999,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000003','00000000-0000-0000-0000-700000000017',4999,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000003','00000000-0000-0000-0000-700000000020',1999,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000003','00000000-0000-0000-0000-700000000024',2499,true)
ON CONFLICT (merchant_id, sku_id) DO UPDATE SET
    price_cents = EXCLUDED.price_cents, is_active = EXCLUDED.is_active, updated_at = NOW();

-- ============================================================
-- 10. MERCHANT SERVICES (repair pricing per store)
-- ============================================================

-- City Centre: all 7 services
INSERT INTO merchant_services (id, merchant_id, service_id, price_cents, is_available) VALUES
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001','00000000-0000-0000-0000-400000000001',8900,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001','00000000-0000-0000-0000-400000000002',7900,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001','00000000-0000-0000-0000-400000000003',4900,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001','00000000-0000-0000-0000-400000000004',4500,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001','00000000-0000-0000-0000-400000000005',3900,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001','00000000-0000-0000-0000-400000000006',5900,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000001','00000000-0000-0000-0000-400000000007',6900,true)
ON CONFLICT (merchant_id, service_id) DO UPDATE SET
    price_cents = EXCLUDED.price_cents, is_available = EXCLUDED.is_available, updated_at = NOW();

-- Rathmines: 6 services (no camera repair)
INSERT INTO merchant_services (id, merchant_id, service_id, price_cents, is_available) VALUES
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000002','00000000-0000-0000-0000-400000000001',8500,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000002','00000000-0000-0000-0000-400000000002',7500,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000002','00000000-0000-0000-0000-400000000003',4700,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000002','00000000-0000-0000-0000-400000000004',4300,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000002','00000000-0000-0000-0000-400000000005',3700,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000002','00000000-0000-0000-0000-400000000007',6500,true)
ON CONFLICT (merchant_id, service_id) DO UPDATE SET
    price_cents = EXCLUDED.price_cents, is_available = EXCLUDED.is_available, updated_at = NOW();

-- Swords: 5 core services
INSERT INTO merchant_services (id, merchant_id, service_id, price_cents, is_available) VALUES
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000003','00000000-0000-0000-0000-400000000001',8200,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000003','00000000-0000-0000-0000-400000000002',7200,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000003','00000000-0000-0000-0000-400000000003',4500,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000003','00000000-0000-0000-0000-400000000004',4200,true),
    (gen_random_uuid(),'00000000-0000-0000-0000-500000000003','00000000-0000-0000-0000-400000000005',3500,true)
ON CONFLICT (merchant_id, service_id) DO UPDATE SET
    price_cents = EXCLUDED.price_cents, is_available = EXCLUDED.is_available, updated_at = NOW();

-- ============================================================
-- 11. CONSUMERS (2 test users — OTP/Google auth, no password)
-- ============================================================
INSERT INTO users (id, phone, email, full_name, auth_provider, is_active) VALUES
    ('00000000-0000-0000-0000-800000000001',
     '+353851234567', 'aoife.murphy@gmail.com',
     'Aoife Murphy', 'google', true),
    ('00000000-0000-0000-0000-800000000002',
     '+353861234567', 'ciaran.obrien@gmail.com',
     'Ciarán O''Brien', 'phone', true)
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name, is_active = EXCLUDED.is_active, updated_at = NOW();

-- ============================================================
-- 12. USER ADDRESSES
-- ============================================================
INSERT INTO user_addresses (id, user_id, label, full_name, phone,
    address_line1, city, eircode, is_default) VALUES
    ('00000000-0000-0000-0000-810000000001',
     '00000000-0000-0000-0000-800000000001',
     'Home','Aoife Murphy','+353851234567',
     '14 Portobello Road','Dublin','D08 N2T3',true),
    ('00000000-0000-0000-0000-810000000002',
     '00000000-0000-0000-0000-800000000002',
     'Home','Ciarán O''Brien','+353861234567',
     '7 Malahide Road','Swords','K67 A1B2',true)
ON CONFLICT (id) DO UPDATE SET
    address_line1 = EXCLUDED.address_line1, updated_at = NOW();

-- ============================================================
-- 13. MEMBERSHIP PLANS (2 tiers)
-- ============================================================
INSERT INTO membership_plans (id, name, description, price_cents, duration_days, benefits, is_active, sort_order) VALUES
    ('00000000-0000-0000-0000-aa0000000001',
     'Basic Protection',
     'One free iPhone/Samsung screen replacement per year.',
     4999, 365,
     '{"screen_replacements":1,"battery_replacements":0,"repair_discount_percent":5,"eligible_brands":["Apple","Samsung"],"max_device_value_cents":100000}',
     true, 1),
    ('00000000-0000-0000-0000-aa0000000002',
     'Premium Care',
     'Two free screen replacements + one battery replacement per year. Priority booking.',
     8999, 365,
     '{"screen_replacements":2,"battery_replacements":1,"repair_discount_percent":10,"eligible_brands":["Apple","Samsung","Google"],"max_device_value_cents":200000}',
     true, 2)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, price_cents = EXCLUDED.price_cents,
    benefits = EXCLUDED.benefits, updated_at = NOW();

-- ============================================================
-- 14. REPAIR BOOKINGS (4 demo bookings — full lifecycle)
-- ============================================================
INSERT INTO repair_bookings (
    id, booking_no, user_id, merchant_id, service_id,
    device_brand, device_model, fault_description,
    booking_time, status, quoted_price_cents, notes
) VALUES

-- pending_confirm: Aoife → City Centre → iPhone Screen
('00000000-0000-0000-0000-900000000001',
 'RB-20260530-0001',
 '00000000-0000-0000-0000-800000000001',
 '00000000-0000-0000-0000-500000000001',
 '00000000-0000-0000-0000-400000000001',
 'Apple','iPhone 15 Pro',
 'Cracked screen after drop. Touch still works but display is badly damaged.',
 CURRENT_DATE + INTERVAL '1 day' + INTERVAL '10 hours',
 'pending_confirm', 8900,
 'Please call before appointment to confirm parts availability.'),

-- confirmed: Aoife → Rathmines → iPhone Battery
('00000000-0000-0000-0000-900000000002',
 'RB-20260531-0002',
 '00000000-0000-0000-0000-800000000001',
 '00000000-0000-0000-0000-500000000002',
 '00000000-0000-0000-0000-400000000003',
 'Apple','iPhone 14 Pro',
 'Battery at 71% health, drains fast and shuts off unexpectedly.',
 CURRENT_DATE + INTERVAL '5 days' + INTERVAL '14 hours',
 'confirmed', 4700, NULL),

-- completed: Ciarán → City Centre → Water Damage
('00000000-0000-0000-0000-900000000003',
 'RB-20260522-0003',
 '00000000-0000-0000-0000-800000000002',
 '00000000-0000-0000-0000-500000000001',
 '00000000-0000-0000-0000-400000000007',
 'Samsung','Samsung Galaxy S24',
 'Phone submerged at the beach. Will not turn on at all.',
 NOW() - INTERVAL '7 days',
 'completed', 6900, NULL),

-- cancelled: Ciarán → Swords → Samsung Screen
('00000000-0000-0000-0000-900000000004',
 'RB-20260520-0004',
 '00000000-0000-0000-0000-800000000002',
 '00000000-0000-0000-0000-500000000003',
 '00000000-0000-0000-0000-400000000002',
 'Samsung','Samsung Galaxy S24 Ultra',
 'Screen cracked in one corner, display has a dead zone.',
 NOW() - INTERVAL '9 days',
 'cancelled', 7200, NULL)

ON CONFLICT (booking_no) DO UPDATE SET
    status            = EXCLUDED.status,
    quoted_price_cents= EXCLUDED.quoted_price_cents,
    updated_at        = NOW();

-- Finalise the completed booking
UPDATE repair_bookings SET
    actual_price_cents = 6900,
    payment_method     = 'in_store_card',
    completed_at       = NOW() - INTERVAL '7 days' + INTERVAL '2 hours'
WHERE id = '00000000-0000-0000-0000-900000000003';

-- Finalise the cancelled booking
UPDATE repair_bookings SET
    cancelled_reason = 'Customer found a cheaper quote elsewhere.'
WHERE id = '00000000-0000-0000-0000-900000000004';

-- ============================================================
-- 15. SYSTEM CONFIGS
-- ============================================================
INSERT INTO system_configs (key, value, description) VALUES
    ('default_commission_rate',    '10.00', 'Default repair booking commission (%)'),
    ('sms_provider',               'twilio', 'SMS service provider'),
    ('stripe_payout_delay_days',   '7',     'Days before accessories order payout to merchant'),
    ('max_search_radius_km',       '25',    'Max radius for nearby store search (km)'),
    ('default_search_radius_km',   '10',    'Default radius for nearby store search (km)'),
    ('platform_name',              'IERepair', 'Platform display name'),
    ('support_email',              'support@ierepair.ie', 'Customer support email'),
    ('support_phone',              '+353 1 234 5678', 'Customer support phone (IE)'),
    ('eircode_cache_ttl_days',     '30',    'Eircode→coordinate Redis cache TTL (days)'),
    ('min_booking_advance_hours',  '2',     'Minimum advance booking time (hours)'),
    ('max_booking_advance_days',   '30',    'Maximum advance booking window (days)')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

COMMIT;

-- ============================================================
-- QUICK VERIFICATION  (run after seed)
-- ============================================================
-- SELECT 'admin_users'       , count(*) FROM admin_users;        -- 1
-- SELECT 'suppliers'         , count(*) FROM suppliers;          -- 1
-- SELECT 'product_categories', count(*) FROM product_categories; -- 7
-- SELECT 'repair_services'   , count(*) FROM repair_services;    -- 7
-- SELECT 'merchants'         , count(*) FROM merchants;          -- 3
-- SELECT 'merchant_hours'    , count(*) FROM merchant_hours;     -- 21
-- SELECT 'products'          , count(*) FROM products;           -- 15
-- SELECT 'product_skus'      , count(*) FROM product_skus;       -- 25
-- SELECT 'merchant_products' , count(*) FROM merchant_products;  -- 34
-- SELECT 'merchant_services' , count(*) FROM merchant_services;  -- 18
-- SELECT 'users'             , count(*) FROM users;              -- 2
-- SELECT 'user_addresses'    , count(*) FROM user_addresses;     -- 2
-- SELECT 'membership_plans'  , count(*) FROM membership_plans;   -- 2
-- SELECT 'repair_bookings'   , count(*) FROM repair_bookings;    -- 4
-- SELECT 'system_configs'    , count(*) FROM system_configs;     -- 11
