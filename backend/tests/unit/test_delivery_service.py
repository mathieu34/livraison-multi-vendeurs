import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException
from services.delivery_service import DeliveryService


@pytest.fixture
def mock_repo():
    return MagicMock()


@pytest.fixture
def service(mock_repo):
    return DeliveryService(repo=mock_repo)


class TestAssignLivreur:
    def test_rejette_si_livreur_a_atteint_la_limite(self, service, mock_repo):
        mock_repo.is_livreur_available.return_value = False
        with pytest.raises(HTTPException) as exc:
            service.assign_livreur(MagicMock(), "order-1", "livreur-1", "1 rue Test")
        assert exc.value.status_code == 409

    def test_rejette_si_livraison_existe_deja(self, service, mock_repo):
        mock_repo.is_livreur_available.return_value = True
        mock_repo.find_by_order_id.return_value = {"id": "existing-delivery"}
        with pytest.raises(HTTPException) as exc:
            service.assign_livreur(MagicMock(), "order-1", "livreur-1", "1 rue Test")
        assert exc.value.status_code == 409

    def test_cree_livraison_si_livreur_disponible(self, service, mock_repo):
        mock_repo.is_livreur_available.return_value = True
        mock_repo.find_by_order_id.return_value = None

        delivery_mock = MagicMock()
        delivery_mock.id = "new-delivery"
        delivery_mock.status = "en_attente"
        mock_repo.create.return_value = delivery_mock

        result = service.assign_livreur(MagicMock(), "order-1", "livreur-1", "1 rue Test")
        assert result.id == "new-delivery"


class TestUpdateStatus:
    def test_rejette_transition_invalide(self, service, mock_repo):
        mock_repo.find_by_id.return_value = {
            "id": "d1", "status": "livree", "livreur_id": "l1"
        }
        with pytest.raises(HTTPException) as exc:
            service.update_status(MagicMock(), "d1", "en_cours", user_id="l1", user_role="livreur")
        assert exc.value.status_code == 400

    def test_rejette_si_mauvais_livreur(self, service, mock_repo):
        mock_repo.find_by_id.return_value = {
            "id": "d1", "status": "assignee", "livreur_id": "livreur-A"
        }
        with pytest.raises(HTTPException) as exc:
            service.update_status(MagicMock(), "d1", "en_cours", user_id="livreur-B", user_role="livreur")
        assert exc.value.status_code == 403

    def test_autorise_transition_valide_par_bon_livreur(self, service, mock_repo):
        mock_repo.find_by_id.return_value = {
            "id": "d1", "status": "assignee", "livreur_id": "livreur-A"
        }
        updated_mock = MagicMock()
        updated_mock.status = "en_cours"
        mock_repo.update_status.return_value = updated_mock

        result = service.update_status(
            MagicMock(), "d1", "en_cours", user_id="livreur-A", user_role="livreur"
        )
        assert result.status == "en_cours"
