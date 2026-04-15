# backend/models/user.py
from sqlalchemy import Column, Integer, String, Enum
from database import Base
import enum

class UserRole(str, enum.Enum):
    CLIENT = "client"
    VENDEUR = "vendeur"
    LIVREUR = "livreur"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default=UserRole.CLIENT) # Gestion des rôles