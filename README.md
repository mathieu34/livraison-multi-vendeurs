# Plateforme de gestion de livraisons multi-vendeurs

Architecture n-tiers — Cas pratique IPSSI

---

## Stack technique choisie

| Couche | Technologie |
|---|---|
| Front-end | React 18 + Vite + TailwindCSS |
| Back-end | FastAPI + SQLAlchemy |
| Base de données | PostgreSQL |
| DevOps | Docker + Docker Compose + Git |

---

## Architecture n-tiers

```
┌─────────────────────────────────────────┐
│           Présentation (Front-end)       │
│         React + Vite + TailwindCSS       │
└────────────────────┬────────────────────┘
                     │ HTTP / REST
┌────────────────────▼────────────────────┐
│              API Gateway                 │
│         FastAPI — /api/v1/...            │
├──────────────┬──────────────────────────┤
│  Auth        │  Products  │  Deliveries  │
│  Service     │  Service   │  Service     │
├──────────────┴──────────────────────────┤
│          Couche accès données            │
│       Repository (SQLAlchemy ORM)        │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│            Base de données               │
│               PostgreSQL                 │
└─────────────────────────────────────────┘
```

---

## Modèle de données principal

```
User                    Product
────────────────        ────────────────
id (UUID)               id (UUID)
name                    name
email (unique)          description
password_hash           price
role (enum)             stock
created_at              vendor_id → User
                        category_id → Category

Order                   Delivery
────────────────        ────────────────
id (UUID)               id (UUID)
client_id → User        order_id → Order
status (enum)           livreur_id → User
total_amount            address
created_at              status (enum)
                        current_position
                        delivered_at

Payment                 Category
────────────────        ────────────────
id (UUID)               id (UUID)
order_id → Order        name (unique)
amount
commission (10%)
vendor_amount
method (enum)
status (enum)
```

---

## Conventions GIT / Branches

```
master
├── feat/auth-registration
├── feat/auth-login
├── feat/api-products
├── feat/api-deliveries
├── feat/api-orders
├── feat/payment-simulation
├── feat/frontend-catalogue
├── feat/frontend-dashboard
├── feat/frontend-tracking
└── fix/...
```

| Préfixe | Usage |
|---|---|
| `feat/` | Nouvelle fonctionnalité |
| `fix/` | Correction de bug |
| `test/` | Tests uniquement |
| `docs/` | Documentation |
| `chore/` | Config, CI/CD |

---

## Répartition des responsabilités

### Personne 1 — Auth · Commandes · Administration

| Tâche | Détail |
|---|---|
| Setup FastAPI + SQLAlchemy | Structure du projet, config DB, middlewares |
| API `/auth` | Inscription, connexion JWT, gestion des rôles, profil |
| API `/orders` | Panier, commande multi-vendeurs, split par vendeur |
| API `/admin` | Gestion utilisateurs, statistiques |
| Front-end : Auth | Pages login, register, gestion de profil |
| Front-end : Commandes | Panier, récapitulatif commande, historique |
| Tests intégration | API auth & orders |
| UML | Diagramme de classes + séquence commande |

### Personne 2 — Front-end · Produits · Livraisons

| Tâche | Détail |
|---|---|
| Setup React/Vite/TailwindCSS | Structure pages, routing, service API |
| API `/products` | CRUD produits, catégories, gestion stock concurrent |
| API `/deliveries` | Attribution livreur, suivi, limite 10 livraisons/livreur |
| Simulation paiement | Paiement carte/PayPal, commission 10%, statuts commande |
| Front-end : Catalogue | Filtre catégories, grille produits, stock |
| Front-end : Dashboard | Dashboard livreur, changement de statut |
| Front-end : Suivi | Timeline livraison, polling 10s |
| Tests unitaires | ProductService, DeliveryService (13 tests) |
| Tests intégration | API produits & livraisons |
| BDD complète | Migrations + seed (tous acteurs) |
| UML | Cas d'utilisation + séquence livraison + états |
| Bonus | WebSocket suivi temps réel |

---

## Règles métier implémentées

- **Split commandes par vendeur** : une commande peut contenir des produits de plusieurs vendeurs (`order_items.vendor_id`)
- **Stock concurrent** : décrémentation avec verrou (`SELECT ... FOR UPDATE`) pour éviter les ventes en négatif
- **Limite livraisons** : un livreur ne peut pas avoir plus de 10 livraisons actives simultanément
- **Commission plateforme** : 10% prélevés sur chaque paiement (`PLATFORM_COMMISSION=0.10`)
- **Transitions de statut** : `en_attente → assignee → en_cours → livree` (transitions invalides rejetées)

---

## Structure du projet

```
.
├── docker-compose.yml
├── database/
│   ├── migrations/
│   │   └── 001_init.sql          ← schéma complet
│   └── seeds/
│       └── 001_seed.sql          ← données de dev
├── backend/                      ← FastAPI + SQLAlchemy (Python)
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/               ← SQLAlchemy models
│   │   ├── schemas/              ← Pydantic schemas
│   │   ├── repositories/         ← accès données
│   │   ├── services/             ← logique métier
│   │   └── routers/              ← endpoints FastAPI
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   └── requirements.txt
└── frontend/                     ← React + Vite + TailwindCSS
    └── src/
        ├── pages/
        │   ├── CataloguePage.jsx
        │   ├── DashboardPage.jsx
        │   └── DeliveryTrackingPage.jsx
        ├── services/
        │   └── api.js
        └── components/
```

---

## Lancer le projet

### Avec Docker (recommandé)

```bash
docker-compose up
```

| Service | URL |
|---|---|
| Front-end | http://localhost:5173 |
| Back-end API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

### Sans Docker

```bash
# Base de données
psql -U postgres -d livraison_db -f database/migrations/001_init.sql
psql -U postgres -d livraison_db -f database/seeds/001_seed.sql

# Back-end
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Front-end
cd frontend
npm install && npm run dev
```

### Comptes de test

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | admin@test.com | password123 |
| Vendeur A | vendeurA@test.com | password123 |
| Vendeur B | vendeurB@test.com | password123 |
| Livreur | livreur@test.com | password123 |
| Client | client@test.com | password123 |

### Tests

```bash
cd backend
pytest tests/unit          # sans BDD
pytest tests/integration   # nécessite PostgreSQL
```

---

## Diagramme de séquence — Commande

```
Client          API             OrderService        DB
  │──── POST /orders ────►│                         │
  │                        │──── valider panier ───►│
  │                        │◄─── produits + stock ──│
  │                        │──── BEGIN transaction ─│
  │                        │──── decrement stock ──►│
  │                        │──── créer order ───────►│
  │                        │──── créer order_items ─►│
  │                        │──── COMMIT ────────────►│
  │◄─── 201 order ─────────│                         │
```

## Diagramme de séquence — Livraison

```
Admin           API             DeliveryService     DB
  │── POST /deliveries ───►│                         │
  │                        │── vérif disponibilité ─►│
  │                        │◄── count < 10 ──────────│
  │                        │── créer livraison ─────►│
  │◄── 201 delivery ───────│                         │

Livreur         API             DeliveryService
  │── PATCH /deliveries/:id/status ──►│
  │                                   │── vérif transition valide
  │                                   │── vérif livreur assigné
  │◄── 200 updated status ────────────│
```

## Diagramme d'états — Livraison

```
           ┌──────────────┐
           │  en_attente  │
           └──────┬───────┘
                  │ attribution livreur
           ┌──────▼───────┐
           │   assignee   │
           └──────┬───────┘
                  │ livreur démarre
           ┌──────▼───────┐
           │   en_cours   │
           └──────┬───────┘
                  │ livraison effectuée
           ┌──────▼───────┐
           │    livree    │
           └──────────────┘
                  ▲ annulee (depuis tout état sauf livree)
```
