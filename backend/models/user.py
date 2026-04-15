from sqlalchemy import Column, String, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from database import Base
import uuid
import enum

class UserRole(str, enum.Enum):
    CLIENT   = "client"
    VENDEUR  = "vendeur"
    LIVREUR  = "livreur"
    ADMIN    = "admin"

class User(Base):
    __tablename__ = "users"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name          = Column(String(100), nullable=False)
    email         = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role          = Column(SAEnum(UserRole), default=UserRole.CLIENT, nullable=False)
