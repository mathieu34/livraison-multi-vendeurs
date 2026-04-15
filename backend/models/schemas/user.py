# backend/schemas/user.py
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "client"

class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    class Config:
        from_attributes = True