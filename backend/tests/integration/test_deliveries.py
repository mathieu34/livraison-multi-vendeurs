import pytest
from tests.helpers import create_user, token_for, create_order, create_delivery


class TestAssignLivreur:
    def test_refuse_sans_token(self, client, db):
        res = client.post("/api/deliveries", json={})
        assert res.status_code == 403

    def test_refuse_sans_role_admin(self, client, db):
        livreur = create_user(db, "livreur")
        client_user = create_user(db, "client")
        order = create_order(db, client_user.id)
        res = client.post(
            "/api/deliveries",
            json={"order_id": order.id, "livreur_id": livreur.id, "address": "1 rue Test"},
            headers={"Authorization": token_for(livreur)},
        )
        assert res.status_code == 403

    def test_cree_livraison_admin(self, client, db):
        admin = create_user(db, "admin")
        livreur = create_user(db, "livreur")
        client_user = create_user(db, "client")
        order = create_order(db, client_user.id)
        res = client.post(
            "/api/deliveries",
            json={"order_id": order.id, "livreur_id": livreur.id, "address": "1 rue Test"},
            headers={"Authorization": token_for(admin)},
        )
        assert res.status_code == 201
        assert res.json()["data"]["status"] == "assignee"

    def test_refuse_livraison_deja_existante(self, client, db):
        admin = create_user(db, "admin")
        livreur = create_user(db, "livreur")
        client_user = create_user(db, "client")
        order = create_order(db, client_user.id)
        create_delivery(db, order.id, livreur.id)  # première livraison
        res = client.post(
            "/api/deliveries",
            json={"order_id": order.id, "livreur_id": livreur.id, "address": "2 rue Test"},
            headers={"Authorization": token_for(admin)},
        )
        assert res.status_code == 409

    def test_refuse_si_livreur_a_10_livraisons_actives(self, client, db):
        admin = create_user(db, "admin")
        livreur = create_user(db, "livreur")
        client_user = create_user(db, "client")
        # Créer 10 livraisons actives pour ce livreur
        for _ in range(10):
            order = create_order(db, client_user.id)
            create_delivery(db, order.id, livreur.id, status="assignee")
        new_order = create_order(db, client_user.id)
        res = client.post(
            "/api/deliveries",
            json={"order_id": new_order.id, "livreur_id": livreur.id, "address": "99 rue Test"},
            headers={"Authorization": token_for(admin)},
        )
        assert res.status_code == 409


class TestTrackDelivery:
    def test_retourne_la_livraison(self, client, db):
        livreur = create_user(db, "livreur")
        client_user = create_user(db, "client")
        order = create_order(db, client_user.id)
        delivery = create_delivery(db, order.id, livreur.id)
        res = client.get(f"/api/deliveries/{delivery.id}/track")
        assert res.status_code == 200

    def test_retourne_404_si_inexistante(self, client, db):
        res = client.get("/api/deliveries/00000000-0000-0000-0000-000000000000/track")
        assert res.status_code == 404


class TestUpdateStatus:
    def test_livreur_peut_passer_assignee_en_cours(self, client, db):
        livreur = create_user(db, "livreur")
        client_user = create_user(db, "client")
        order = create_order(db, client_user.id)
        delivery = create_delivery(db, order.id, livreur.id, status="assignee")
        res = client.patch(
            f"/api/deliveries/{delivery.id}/status",
            json={"status": "en_cours"},
            headers={"Authorization": token_for(livreur)},
        )
        assert res.status_code == 200
        assert res.json()["data"]["status"] == "en_cours"

    def test_refuse_transition_invalide(self, client, db):
        livreur = create_user(db, "livreur")
        client_user = create_user(db, "client")
        order = create_order(db, client_user.id)
        delivery = create_delivery(db, order.id, livreur.id, status="livree")
        res = client.patch(
            f"/api/deliveries/{delivery.id}/status",
            json={"status": "en_cours"},
            headers={"Authorization": token_for(livreur)},
        )
        assert res.status_code == 400

    def test_refuse_si_mauvais_livreur(self, client, db):
        livreur = create_user(db, "livreur")
        other = create_user(db, "livreur")
        client_user = create_user(db, "client")
        order = create_order(db, client_user.id)
        delivery = create_delivery(db, order.id, livreur.id, status="assignee")
        res = client.patch(
            f"/api/deliveries/{delivery.id}/status",
            json={"status": "en_cours"},
            headers={"Authorization": token_for(other)},
        )
        assert res.status_code == 403
