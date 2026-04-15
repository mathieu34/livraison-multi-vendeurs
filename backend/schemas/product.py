from typing import Optional
from decimal import Decimal
from pydantic import BaseModel


class CategoryOut(BaseModel):
    id: str
    name: str

    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal
    stock: int
    category_id: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    stock: Optional[int] = None
    category_id: Optional[str] = None


class ProductOut(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    price: Decimal
    stock: int
    vendor_id: str
    category_id: Optional[str] = None

    class Config:
        from_attributes = True
