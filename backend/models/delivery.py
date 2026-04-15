import uuid
from sqlalchemy import Column, String, Text, Numeric, Integer, DateTime, ForeignKey, Computed
from sqlalchemy.sql import func
from database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    status = Column(String(20), nullable=False, default="en_attente")
    total_amount = Column(Numeric(10, 2), nullable=False, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    vendor_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    # subtotal est calculé en PostgreSQL (GENERATED ALWAYS AS), lu en lecture seule
    subtotal = Column(Numeric(10, 2), Computed("quantity * unit_price", persisted=True))


class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("orders.id"), nullable=False)
    livreur_id = Column(String(36), ForeignKey("users.id"))
    address = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="en_attente")
    current_position = Column(Text)
    delivered_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
