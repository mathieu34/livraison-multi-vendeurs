from typing import Optional
from decimal import Decimal
from pydantic import BaseModel


class PaymentProcess(BaseModel):
    order_id: str
    method: str = "carte"
    card_number: Optional[str] = None


class PaymentOut(BaseModel):
    order_id: str
    status: str
    amount: Decimal
    commission: Decimal
    vendor_amount: Decimal
    method: str
