-- Seed de développement

-- Catégories
INSERT INTO categories (name) VALUES
  ('Électronique'),
  ('Vêtements'),
  ('Alimentation'),
  ('Livres'),
  ('Sport')
ON CONFLICT DO NOTHING;

-- Utilisateurs de test (password = "password123" hashé bcrypt)
INSERT INTO users (name, email, password_hash, role) VALUES
  ('Admin Test',    'admin@test.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8.', 'admin'),
  ('Vendeur A',     'vendeur@test.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8.', 'vendeur'),
  ('Livreur Bob',   'livreur@test.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8.', 'livreur'),
  ('Client Alice',  'client@test.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8.', 'client')
ON CONFLICT (email) DO NOTHING;
