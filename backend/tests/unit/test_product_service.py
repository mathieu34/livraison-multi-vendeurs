import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException
from services.product_service import ProductService


@pytest.fixture
def mock_repo():
    return MagicMock()


@pytest.fixture
def service(mock_repo):
    return ProductService(repo=mock_repo)


class TestGetProductById:
    def test_retourne_le_produit_si_trouve(self, service, mock_repo):
        mock_repo.find_by_id.return_value = {"id": "1", "name": "Test", "price": 10, "stock": 5}
        result = service.get_product_by_id(MagicMock(), "1")
        assert result["id"] == "1"

    def test_leve_404_si_non_trouve(self, service, mock_repo):
        mock_repo.find_by_id.return_value = None
        with pytest.raises(HTTPException) as exc:
            service.get_product_by_id(MagicMock(), "999")
        assert exc.value.status_code == 404


class TestCreateProduct:
    def test_rejette_prix_negatif(self, service):
        with pytest.raises(HTTPException) as exc:
            service.create_product(MagicMock(), "X", None, -1, 10, "vendor1")
        assert exc.value.status_code == 400

    def test_rejette_prix_zero(self, service):
        with pytest.raises(HTTPException) as exc:
            service.create_product(MagicMock(), "X", None, 0, 10, "vendor1")
        assert exc.value.status_code == 400

    def test_rejette_stock_negatif(self, service):
        with pytest.raises(HTTPException) as exc:
            service.create_product(MagicMock(), "X", None, 10, -5, "vendor1")
        assert exc.value.status_code == 400

    def test_cree_produit_avec_donnees_valides(self, service, mock_repo):
        mock_repo.create.return_value = {"id": "1", "name": "Produit A", "price": 20, "stock": 3}
        result = service.create_product(MagicMock(), "Produit A", None, 20, 3, "vendor1")
        assert result["name"] == "Produit A"
        mock_repo.create.assert_called_once()


class TestUpdateProduct:
    def test_interdit_modification_par_autre_vendeur(self, service, mock_repo):
        mock_repo.find_by_id.return_value = {"id": "1", "vendor_id": "vendor-A"}
        with pytest.raises(HTTPException) as exc:
            service.update_product(MagicMock(), "1", {"price": 99}, "vendor-B", "vendeur")
        assert exc.value.status_code == 403

    def test_autorise_modification_par_admin(self, service, mock_repo):
        mock_repo.find_by_id.return_value = {"id": "1", "vendor_id": "vendor-A"}
        mock_repo.update.return_value = {"id": "1", "price": 99}
        result = service.update_product(MagicMock(), "1", {"price": 99}, "admin-id", "admin")
        assert result is not None
