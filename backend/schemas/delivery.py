from typing import Optional
from pydantic import BaseModel


class DeliveryCreate(BaseModel):
    order_id: str
    livreur_id: str
    address: str


class DeliveryStatusUpdate(BaseModel):
    status: str
    position: Optional[str] = None


class DeliveryOut(BaseModel):
    id: str
    order_id: str
    livreur_id: Optional[str] = None
    address: str
    status: str
    current_position: Optional[str] = None
    delivered_at: Optional[str] = None

    class Config:
        from_attributes = True
