from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from middlewares.auth import get_current_user, require_roles
from services.order_service import order_service
from schemas.order import OrderCreate

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", status_code=201)
def create_order(
    body: OrderCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("client", "admin")),
):
    order = order_service.create_order(db, body.items, user["sub"])
    return {"success": True, "data": {"id": order.id, "status": order.status,
                                       "total_amount": float(order.total_amount)}}


@router.get("/me")
def get_my_orders(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    orders = order_service.get_my_orders(db, user["sub"])
    return {"success": True, "data": [
        {"id": o.id, "status": o.status, "total_amount": float(o.total_amount),
         "created_at": str(o.created_at)} for o in orders
    ]}


@router.get("")
def get_all(
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("admin")),
):
    orders = order_service.get_all(db)
    return {"success": True, "data": [
        {"id": o.id, "status": o.status, "total_amount": float(o.total_amount),
         "created_at": str(o.created_at), "client_id": o.client_id} for o in orders
    ]}


@router.get("/{order_id}")
def get_by_id(
    order_id: str,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    order = order_service.get_by_id(db, order_id, user["sub"], user["role"])
    return {"success": True, "data": {"id": order.id, "status": order.status,
                                       "total_amount": float(order.total_amount)}}
