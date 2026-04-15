from typing import List, Optional
from decimal import Decimal
from pydantic import BaseModel


class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int


class OrderCreate(BaseModel):
    items: List[OrderItemCreate]


class OrderOut(BaseModel):
    id: str
    status: str
    total_amount: Decimal
    created_at: Optional[str] = None

    class Config:
        from_attributes = True
