-- Seed de développement
-- password = "password123" pour tous les comptes

-- =====================
-- UTILISATEURS
-- =====================
INSERT INTO users (id, name, email, password_hash, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Admin',        'admin@test.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8.', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'Vendeur A',    'vendeurA@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8.', 'vendeur'),
  ('00000000-0000-0000-0000-000000000003', 'Vendeur B',    'vendeurB@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8.', 'vendeur'),
  ('00000000-0000-0000-0000-000000000004', 'Livreur Bob',  'livreur@test.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8.', 'livreur'),
  ('00000000-0000-0000-0000-000000000005', 'Client Alice', 'client@test.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8.', 'client'),
  ('00000000-0000-0000-0000-000000000006', 'Client Marc',  'marc@test.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8.', 'client')
ON CONFLICT DO NOTHING;

-- =====================
-- CATÉGORIES
-- =====================
INSERT INTO categories (id, name) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Électronique'),
  ('10000000-0000-0000-0000-000000000002', 'Vêtements'),
  ('10000000-0000-0000-0000-000000000003', 'Alimentation'),
  ('10000000-0000-0000-0000-000000000004', 'Livres'),
  ('10000000-0000-0000-0000-000000000005', 'Sport')
ON CONFLICT DO NOTHING;

-- =====================
-- PRODUITS (Vendeur A)
-- =====================
INSERT INTO products (id, name, description, price, stock, vendor_id, category_id) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Smartphone X12',     'Écran OLED 6.5", 128Go',        699.99, 15, '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', 'Écouteurs Bluetooth', 'Réduction de bruit active',     89.99,  30, '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000003', 'Chargeur USB-C 65W',  'Charge rapide toutes marques',  29.99,  50, '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000004', 'Roman - Dune',        'Frank Herbert - édition poche', 12.50,  20, '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004')
ON CONFLICT DO NOTHING;

-- =====================
-- PRODUITS (Vendeur B)
-- =====================
INSERT INTO products (id, name, description, price, stock, vendor_id, category_id) VALUES
  ('20000000-0000-0000-0000-000000000005', 'Veste de sport',    'Coupe-vent imperméable, taille M', 59.99,  10, '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005'),
  ('20000000-0000-0000-0000-000000000006', 'Tapis de yoga',     'Antidérapant, 6mm épaisseur',     34.99,  25, '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005'),
  ('20000000-0000-0000-0000-000000000007', 'Café Bio 500g',     'Arabica éthiopien, torréfaction', 14.90,   0, '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000008', 'T-shirt coton bio', 'Col rond, unisexe, taille L',     24.99,   8, '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- =====================
-- COMMANDES
-- =====================
INSERT INTO orders (id, client_id, status, total_amount) VALUES
  -- Commande payée (Alice, multi-vendeurs)
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'payee',     819.98),
  -- Commande en attente de paiement (Alice)
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'en_attente', 89.99),
  -- Commande livrée (Marc)
  ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', 'livree',     94.98),
  -- Commande expédiée (Marc)
  ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', 'expediee',   34.99)
ON CONFLICT DO NOTHING;

-- =====================
-- LIGNES DE COMMANDE
-- =====================
INSERT INTO order_items (order_id, product_id, vendor_id, quantity, unit_price) VALUES
  -- Commande 1 : Smartphone (Vendeur A) + Veste de sport (Vendeur B)
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 1, 699.99),
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', 2, 59.99),
  -- Commande 2 : Écouteurs (Vendeur A)
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 1, 89.99),
  -- Commande 3 : Tapis yoga + Roman (Marc)
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', 1, 34.99),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 1, 12.50),
  -- Commande 4 : Tapis yoga (Marc)
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', 1, 34.99)
ON CONFLICT DO NOTHING;

-- =====================
-- LIVRAISONS
-- =====================
INSERT INTO deliveries (id, order_id, livreur_id, address, status, delivered_at) VALUES
  -- Commande 1 : en cours de livraison
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', '12 rue de la Paix, 75001 Paris',  'en_cours', NULL),
  -- Commande 3 : livrée
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', '5 avenue Victor Hugo, 69001 Lyon', 'livree',   NOW() - INTERVAL '2 days'),
  -- Commande 4 : assignée
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', '8 rue du Commerce, 33000 Bordeaux','assignee', NULL)
ON CONFLICT DO NOTHING;

-- =====================
-- PAIEMENTS
-- =====================
INSERT INTO payments (order_id, amount, commission, vendor_amount, method, status) VALUES
  ('30000000-0000-0000-0000-000000000001', 819.98, 82.00,  737.98, 'carte',   'validee'),
  ('30000000-0000-0000-0000-000000000003',  94.98,  9.50,   85.48, 'paypal',  'validee')
ON CONFLICT DO NOTHING;
