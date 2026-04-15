import os
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            os.getenv("JWT_SECRET", "change_in_production"),
            algorithms=["HS256"],
        )
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expiré ou invalide")


def require_roles(*roles: str):
    """Factory de dépendance FastAPI pour restreindre l'accès par rôle."""
    def checker(user: dict = Depends(get_current_user)) -> dict:
        if user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Accès interdit")
        return user
    return checker
