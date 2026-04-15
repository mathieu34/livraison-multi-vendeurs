# backend/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.user import UserCreate, UserOut
from services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # On délègue la logique au service 
    return AuthService.create_user(db, user_data)