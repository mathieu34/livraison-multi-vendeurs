-- Migration 001 : Initialisation du schéma

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Utilisateurs (tous rôles)
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role        VARCHAR(20) NOT NULL CHECK (role IN ('client', 'vendeur', 'livreur', 'admin')),
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- Catégories produits
CREATE TABLE IF NOT EXISTS categories (
  id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name  VARCHAR(100) UNIQUE NOT NULL
);

-- Produits
CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  price       NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  vendor_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- Commandes
CREATE TABLE IF NOT EXISTS orders (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id    UUID NOT NULL REFERENCES users(id),
  status       VARCHAR(20) NOT NULL DEFAULT 'en_attente'
                CHECK (status IN ('en_attente', 'payee', 'expediee', 'livree', 'annulee')),
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- Lignes de commande (1 commande peut avoir plusieurs vendeurs)
CREATE TABLE IF NOT EXISTS order_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  vendor_id  UUID NOT NULL REFERENCES users(id),
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL,
  subtotal   NUMERIC(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- Livraisons
CREATE TABLE IF NOT EXISTS deliveries (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id         UUID NOT NULL REFERENCES orders(id),
  livreur_id       UUID REFERENCES users(id),
  address          TEXT NOT NULL,
  status           VARCHAR(20) NOT NULL DEFAULT 'en_attente'
                    CHECK (status IN ('en_attente', 'assignee', 'en_cours', 'livree', 'annulee')),
  current_position TEXT,
  delivered_at     TIMESTAMP,
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);

-- Paiements (simulation)
CREATE TABLE IF NOT EXISTS payments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES orders(id),
  amount        NUMERIC(10, 2) NOT NULL,
  commission    NUMERIC(10, 2) NOT NULL,
  vendor_amount NUMERIC(10, 2) NOT NULL,
  method        VARCHAR(20) NOT NULL DEFAULT 'carte' CHECK (method IN ('carte', 'paypal', 'virement')),
  status        VARCHAR(20) NOT NULL DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'validee', 'echouee')),
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Index utiles
CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_livreur ON deliveries(livreur_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_order ON deliveries(order_id);
