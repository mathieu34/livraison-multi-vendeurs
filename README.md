# Plateforme de gestion de livraisons multi-vendeurs

Architecture n-tiers - Cas pratique IPSSI

## Membres du projet
Voguie Bathy et Mathieu Ponnou

## Lancer le projet

### Demarrage rapide

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Front-end | http://localhost:5173 |
| Back-end API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| PostgreSQL | localhost:5434 |

### Sans Docker

```bash
# Base de donnees
psql -U postgres -d livraison_db -f database/migrations/001_init.sql
psql -U postgres -d livraison_db -f database/seeds/001_seed.sql

# Back-end
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Front-end
cd frontend
npm install
npm run dev
```

### Comptes de test

Les comptes seeds peuvent dependre de l'etat de la base apres rebuild. Pour une demo fiable, il est recommande de creer les comptes necessaires depuis le front ou via l'API avant la demonstration.

Exemples souvent utilises :

| Role | Email | Mot de passe |
|---|---|---|
| Admin demo | admin_demo@test.com | password123 |
| Vendeur demo | vendeur_demo@test.com | password123 |
| Livreur demo | livreur_demo@test.com | password123 |
| Client demo | client_demo@test.com | password123 |

---

## Stack technique choisie

| Couche | Technologie |
|---|---|
| Front-end | React 18 + Vite + TailwindCSS |
| Back-end | FastAPI + SQLAlchemy |
| Base de donnees | PostgreSQL |
| DevOps | Docker + Docker Compose + Git |

---

## Architecture n-tiers

```text
Presentation (Front-end)
  React + Vite + TailwindCSS
        |
        | HTTP / REST
        v
API Gateway
  FastAPI - /api/...
        |
        +-- Auth
        +-- Products
        +-- Orders
        +-- Deliveries
        |
        v
Acces aux donnees
  Repository / SQLAlchemy ORM
        |
        v
Base de donnees
  PostgreSQL
```

---

## Modele de donnees principal

```text
User                    Product
id (UUID)               id (UUID)
name                    name
email (unique)          description
password_hash           price
role (enum)             stock
created_at              vendor_id -> User
                        category_id -> Category

Order                   Delivery
id (UUID)               id (UUID)
client_id -> User       order_id -> Order
status (enum)           livreur_id -> User
total_amount            address
created_at              status (enum)
                        current_position
                        delivered_at

Payment                 Category
id (UUID)               id (UUID)
order_id -> Order       name (unique)
amount
commission (10%)
vendor_amount
method (enum)
status (enum)
```

---


## Repartition des responsabilites

### Personne 1 - Auth, Commandes, Administration

| Tache | Detail |
|---|---|
| Setup FastAPI + SQLAlchemy | Structure du projet, config DB, middlewares |
| API `/auth` | Inscription, connexion JWT, gestion des roles, profil |
| API `/orders` | Panier, commande multi-vendeurs, split par vendeur |
| Administration | Gestion utilisateurs, statistiques |
| Front-end : Auth | Pages login, register, profil |
| Front-end : Commandes | Panier, recapitulatif commande, historique |
| Tests integration | API auth et orders |
| UML | Diagramme de classes + sequence commande |

### Personne 2 - Front-end, Produits, Livraisons

| Tache | Detail |
|---|---|
| Setup React/Vite/TailwindCSS | Structure pages, routing, service API |
| API `/products` | CRUD produits, categories, gestion stock concurrent |
| API `/deliveries` | Attribution livreur, suivi, limite 10 livraisons/livreur |
| Simulation paiement | Paiement carte/PayPal, gestion des statuts |
| Front-end : Catalogue | Filtre categories, grille produits, stock |
| Front-end : Dashboard | Dashboard livreur, changement de statut |
| Front-end : Suivi | Timeline livraison, polling 10s |
| Tests unitaires | ProductService, DeliveryService (14 tests) |
| Tests integration | API produits et livraisons |
| BDD complete | Migrations + seed |
| UML | Cas d'utilisation + sequence livraison + etats |

---

## Regles metier implementees

- Split commandes par vendeur : une commande peut contenir des produits de plusieurs vendeurs (`order_items.vendor_id`)
- Stock concurrent : decrement avec verrou (`SELECT ... FOR UPDATE`) pour eviter les ventes en negatif
- Limite livraisons : un livreur ne peut pas avoir plus de 10 livraisons actives simultanement
- Commission plateforme : 10% preleves sur chaque paiement (`PLATFORM_COMMISSION=0.10`)
- Transitions de statut livraison : `assignee -> en_cours -> livree` avec rejet des transitions invalides

---

## Acteurs et fonctionnalites

### 3. Acteurs

- Client
- Vendeur
- Livreur
- Administrateur

### 4. Exigences fonctionnelles

#### 4.1 Gestion des comptes

- Inscription / connexion
- Gestion des roles
- Gestion du profil

Exemples faisables via le frontend :

- `/login` permet de creer un compte `client`, `vendeur` ou `livreur`
- `/login` permet ensuite de se connecter
- `/profil` affiche le nom, l'email, le role et l'identifiant du compte connecte
- la barre de navigation change selon le role de l'utilisateur

#### 4.2 Catalogue produits

- Ajout / modification produits
- Categories
- Gestion des stocks

Exemples faisables via le frontend :

- `/catalogue` affiche la liste des produits disponibles
- `/catalogue` permet de filtrer par categorie
- `/vendeur` permet de creer un produit
- `/vendeur` permet de modifier ou supprimer un produit
- le stock est visible directement dans les cartes produit

#### 4.3 Commandes

- Panier
- Commande multi-vendeurs

Exemples faisables via le frontend :

- un client connecte peut ajouter un produit au panier depuis `/catalogue`
- `/commandes` affiche le panier courant
- `/commandes` permet de passer une commande
- le back-end gere la commande multi-vendeurs via les lignes `order_items.vendor_id`

#### 4.4 Paiement

- Simulation de paiement
- Gestion des statuts

Exemples faisables via le frontend :

- `/commandes` permet de simuler un paiement par carte
- `/commandes` permet de simuler un paiement par PayPal
- l'historique des commandes affiche le statut de chaque commande

#### 4.5 Livraison

- Attribution d'un livreur
- Suivi de livraison

Exemples faisables via le frontend :

- `/admin` permet d'attribuer un livreur a une commande
- `/dashboard` permet a un livreur de consulter ses livraisons
- `/dashboard` permet de faire avancer le statut d'une livraison
- `/suivi/:deliveryId` affiche la timeline de suivi d'une livraison

#### 4.6 Administration

- Gestion utilisateurs
- Statistiques

Exemples faisables via le frontend :

- `/admin` fournit une vue administrateur
- `/admin` affiche des statistiques simples sur les commandes
- `/admin` permet egalement l'attribution d'un livreur

### 5. Contraintes techniques

Architecture n-tiers :

- Presentation (Front-end) : React + Vite + TailwindCSS
- Logique metier (Back-end) : FastAPI + services metier
- Acces aux donnees : SQLAlchemy + PostgreSQL

Exemple concret :

- le front appelle les routes `/api/...`
- FastAPI applique les regles metier
- SQLAlchemy lit et ecrit les donnees en base PostgreSQL

### 6. Regles metier

- Split des commandes par vendeur
- Gestion du stock concurrent
- Limitation des livraisons par livreur
- Commission plateforme

Exemples concrets :

- une commande client peut contenir plusieurs produits provenant de vendeurs differents
- la creation d'une commande verifie puis decremente le stock cote back-end
- un livreur ne peut pas depasser 10 livraisons actives
- la simulation de paiement applique la commission plateforme configuree

---

## Structure du projet

```text
.
|-- docker-compose.yml
|-- database/
|   |-- migrations/
|   |   \-- 001_init.sql
|   \-- seeds/
|       \-- 001_seed.sql
|-- backend/
|   |-- main.py
|   |-- database.py
|   |-- middlewares/
|   |-- models/
|   |-- schemas/
|   |-- repositories/
|   |-- services/
|   |-- routers/
|   |-- tests/
|   |   |-- unit/
|   |   \-- integration/
|   \-- requirements.txt
\-- frontend/
    \-- src/
        |-- pages/
        |-- services/
        |-- components/
        \-- contexts/
```

### Tests

```bash
cd backend
pytest tests/unit
pytest tests/integration
```

#### 7.3 Tests

- Tests unitaires
- Tests d'integration

Commandes PowerShell :

```powershell
cd backend
pip install -r requirements.txt
pytest tests/unit
pytest tests/integration
pytest
```

Contenu couvert simplement :

- validation de la logique metier des produits
- validation de la logique metier des livraisons
- verification des cas OK et des cas d'erreur
- 14 tests unitaires passes avec succes

Etat actuel :

- les tests unitaires passent
- les tests d'integration existent mais peuvent demander des ajustements d'environnement selon la base de test utilisee

---

## Diagramme de sequence - Commande

```text
Client          API             OrderService        DB
  |---- POST /orders ---->|                         |
  |                       |---- valider panier ---->|
  |                       |<--- produits + stock ---|
  |                       |---- BEGIN transaction ->|
  |                       |---- decrement stock --->|
  |                       |---- creer order ------->|
  |                       |---- creer order_items ->|
  |                       |---- COMMIT ----------->|
  |<--- 201 order --------|                         |
```

## Diagramme de sequence - Livraison

```text
Admin           API             DeliveryService     DB
  |---- POST /deliveries ---->|                    |
  |                           |-- verif dispo --->|
  |                           |<-- count < 10 ----|
  |                           |-- creer livraison >|
  |<--- 201 delivery ---------|                    |

Livreur         API             DeliveryService
  |---- PATCH /deliveries/:id/status ----------->|
  |                                              |-- verif transition valide
  |                                              |-- verif livreur assigne
  |<--- 200 updated status ----------------------|
```

## Diagramme d'etats - Livraison

```text
           +------------+
           |  assignee  |
           +------+-----+
                  |
                  | livreur demarre
           +------v-----+
           |  en_cours  |
           +------+-----+
                  |
                  | livraison effectuee
           +------v-----+
           |   livree   |
           +------------+
```
