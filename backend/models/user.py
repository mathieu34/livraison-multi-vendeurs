import uuid
import enum
from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from database import Base


class UserRole(str, enum.Enum):
    CLIENT = "client"
    VENDEUR = "vendeur"
    LIVREUR = "livreur"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String(20), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
