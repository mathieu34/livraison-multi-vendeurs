from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas.user import UserCreate, UserLogin, UserOut, Token
from services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", response_model=UserOut, status_code=201)
def register(data: UserCreate, db: Session = Depends(get_db)):
    return AuthService.create_user(db, data)

@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    return AuthService.login(db, data)
