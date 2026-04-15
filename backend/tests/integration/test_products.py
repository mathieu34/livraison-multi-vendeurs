import pytest
from tests.helpers import create_user, token_for, create_category, create_product


class TestGetProducts:
    def test_retourne_liste_produits(self, client, db):
        vendor = create_user(db, "vendeur")
        cat = create_category(db)
        create_product(db, vendor.id, cat.id)
        res = client.get("/api/products")
        assert res.status_code == 200
        assert len(res.json()["data"]) == 1

    def test_filtre_par_categorie(self, client, db):
        vendor = create_user(db, "vendeur")
        cat1 = create_category(db, "Electronique")
        cat2 = create_category(db, "Livres")
        create_product(db, vendor.id, cat1.id)
        create_product(db, vendor.id, cat2.id)
        res = client.get(f"/api/products?category_id={cat1.id}")
        assert res.status_code == 200
        assert len(res.json()["data"]) == 1


class TestGetCategories:
    def test_retourne_categories(self, client, db):
        create_category(db, "Electronique")
        res = client.get("/api/products/categories")
        assert res.status_code == 200
        assert len(res.json()["data"]) >= 1


class TestGetProductById:
    def test_retourne_le_produit(self, client, db):
        vendor = create_user(db, "vendeur")
        product = create_product(db, vendor.id)
        res = client.get(f"/api/products/{product.id}")
        assert res.status_code == 200
        assert res.json()["data"]["id"] == product.id

    def test_retourne_404_si_inexistant(self, client, db):
        res = client.get("/api/products/00000000-0000-0000-0000-000000000000")
        assert res.status_code == 404


class TestCreateProduct:
    def test_refuse_sans_token(self, client, db):
        res = client.post("/api/products", json={"name": "X", "price": 10, "stock": 5})
        assert res.status_code == 403

    def test_cree_produit_vendeur(self, client, db):
        vendor = create_user(db, "vendeur")
        cat = create_category(db)
        res = client.post(
            "/api/products",
            json={"name": "Nouveau", "description": "Desc", "price": 49.99,
                  "stock": 5, "category_id": cat.id},
            headers={"Authorization": token_for(vendor)},
        )
        assert res.status_code == 201
        assert res.json()["data"]["name"] == "Nouveau"

    def test_refuse_prix_negatif(self, client, db):
        vendor = create_user(db, "vendeur")
        res = client.post(
            "/api/products",
            json={"name": "X", "price": -5, "stock": 5},
            headers={"Authorization": token_for(vendor)},
        )
        assert res.status_code == 400


class TestUpdateProduct:
    def test_refuse_modification_autre_vendeur(self, client, db):
        vendor = create_user(db, "vendeur")
        other = create_user(db, "vendeur")
        product = create_product(db, vendor.id)
        res = client.put(
            f"/api/products/{product.id}",
            json={"name": "Hack", "price": 1, "stock": 1},
            headers={"Authorization": token_for(other)},
        )
        assert res.status_code == 403

    def test_autorise_modification_proprietaire(self, client, db):
        vendor = create_user(db, "vendeur")
        product = create_product(db, vendor.id)
        res = client.put(
            f"/api/products/{product.id}",
            json={"name": "Modifie", "price": 99, "stock": 3},
            headers={"Authorization": token_for(vendor)},
        )
        assert res.status_code == 200
        assert res.json()["data"]["name"] == "Modifie"


class TestDeleteProduct:
    def test_supprime_le_produit(self, client, db):
        vendor = create_user(db, "vendeur")
        product = create_product(db, vendor.id)
        res = client.delete(
            f"/api/products/{product.id}",
            headers={"Authorization": token_for(vendor)},
        )
        assert res.status_code == 200
