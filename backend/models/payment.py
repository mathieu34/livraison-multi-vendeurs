import uuid
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("orders.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    commission = Column(Numeric(10, 2), nullable=False)
    vendor_amount = Column(Numeric(10, 2), nullable=False)
    method = Column(String(20), nullable=False, default="carte")
    status = Column(String(20), nullable=False, default="en_attente")
    created_at = Column(DateTime, server_default=func.now())
