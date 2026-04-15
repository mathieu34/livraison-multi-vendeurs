from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import os

from models.user import User
from schemas.user import UserCreate, UserLogin

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY  = os.getenv("JWT_SECRET", "change_in_production")
ALGORITHM   = "HS256"
EXPIRE_DAYS = 7

def _hash_password(password: str) -> str:
    return pwd_context.hash(password)

def _verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def _create_token(user: User) -> str:
    expire = datetime.utcnow() + timedelta(days=EXPIRE_DAYS)
    payload = {"sub": str(user.id), "role": user.role, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

class AuthService:
    @staticmethod
    def create_user(db: Session, data: UserCreate) -> User:
        existing = db.query(User).filter(User.email == data.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email déjà utilisé"
            )
        user = User(
            name=data.name,
            email=data.email,
            password_hash=_hash_password(data.password),
            role=data.role,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def login(db: Session, data: UserLogin) -> dict:
        user = db.query(User).filter(User.email == data.email).first()
        if not user or not _verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou mot de passe incorrect"
            )
        token = _create_token(user)
        return {"access_token": token, "token_type": "bearer", "user": user}
