import pytest
from fastapi import HTTPException
from services.auth_service import AuthService
from schemas.user import UserCreate, UserLogin
from models.user import UserRole

def make_user_data(**kwargs):
    defaults = {
        "name": "Test User",
        "email": "test@test.com",
        "password": "password123",
        "role": UserRole.CLIENT,
    }
    return UserCreate(**{**defaults, **kwargs})

class TestCreateUser:
    def test_inscription_ok(self, db):
        data = make_user_data()
        user = AuthService.create_user(db, data)
        assert user.email == "test@test.com"
        assert user.name == "Test User"
        assert user.role == UserRole.CLIENT

    def test_mot_de_passe_est_hashe(self, db):
        data = make_user_data()
        user = AuthService.create_user(db, data)
        assert user.password_hash != "password123"

    def test_email_deja_utilise(self, db):
        AuthService.create_user(db, make_user_data())
        with pytest.raises(HTTPException) as exc:
            AuthService.create_user(db, make_user_data())
        assert exc.value.status_code == 409

    def test_role_vendeur(self, db):
        data = make_user_data(email="vendeur@test.com", role=UserRole.VENDEUR)
        user = AuthService.create_user(db, data)
        assert user.role == UserRole.VENDEUR


class TestLogin:
    def test_login_ok(self, db):
        AuthService.create_user(db, make_user_data())
        result = AuthService.login(db, UserLogin(email="test@test.com", password="password123"))
        assert "access_token" in result
        assert result["token_type"] == "bearer"
        assert result["user"].email == "test@test.com"

    def test_mauvais_mot_de_passe(self, db):
        AuthService.create_user(db, make_user_data())
        with pytest.raises(HTTPException) as exc:
            AuthService.login(db, UserLogin(email="test@test.com", password="mauvais"))
        assert exc.value.status_code == 401

    def test_email_inexistant(self, db):
        with pytest.raises(HTTPException) as exc:
            AuthService.login(db, UserLogin(email="nobody@test.com", password="password123"))
        assert exc.value.status_code == 401

    def test_token_jwt_genere(self, db):
        AuthService.create_user(db, make_user_data())
        result = AuthService.login(db, UserLogin(email="test@test.com", password="password123"))
        from jose import jwt
        import os
        payload = jwt.decode(result["access_token"], os.getenv("JWT_SECRET", "change_in_production"), algorithms=["HS256"])
        assert payload["role"] == UserRole.CLIENT
