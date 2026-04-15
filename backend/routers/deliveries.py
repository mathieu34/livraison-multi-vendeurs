from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from middlewares.auth import get_current_user, require_roles
from services.delivery_service import delivery_service
from services.payment_service import payment_service
from schemas.delivery import DeliveryCreate, DeliveryStatusUpdate
from schemas.payment import PaymentProcess

router = APIRouter(prefix="/api/deliveries", tags=["deliveries"])


# ── Suivi public ──────────────────────────────────────────────────────────────

@router.get("/{delivery_id}/track")
def track(delivery_id: str, db: Session = Depends(get_db)):
    return {"success": True, "data": delivery_service.track_delivery(db, delivery_id)}


# ── Authentifié ───────────────────────────────────────────────────────────────

@router.get("/me")
def get_my_deliveries(
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("livreur")),
):
    return {"success": True, "data": delivery_service.get_deliveries_by_livreur(db, user["sub"])}


@router.get("/livreurs/available")
def get_available_livreurs(
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("admin", "vendeur")),
):
    return {"success": True, "data": delivery_service.get_available_livreurs(db)}


@router.get("/{delivery_id}")
def get_by_id(
    delivery_id: str,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    return {"success": True, "data": delivery_service.get_delivery_by_id(db, delivery_id)}


# ── Attribution (admin) ───────────────────────────────────────────────────────

@router.post("", status_code=201)
def assign(
    body: DeliveryCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("admin")),
):
    delivery = delivery_service.assign_livreur(db, body.order_id, body.livreur_id, body.address)
    return {"success": True, "data": {c.name: getattr(delivery, c.name) for c in delivery.__table__.columns}}


# ── Mise à jour statut (livreur ou admin) ─────────────────────────────────────

@router.patch("/{delivery_id}/status")
def update_status(
    delivery_id: str,
    body: DeliveryStatusUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("livreur", "admin")),
):
    delivery = delivery_service.update_status(
        db, delivery_id, body.status,
        user_id=user["sub"], user_role=user["role"], position=body.position,
    )
    return {"success": True, "data": {c.name: getattr(delivery, c.name) for c in delivery.__table__.columns}}


# ── Paiement (simulation) ─────────────────────────────────────────────────────

@router.post("/payment")
def process_payment(
    body: PaymentProcess,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    result = payment_service.process_payment(db, body.order_id, body.method, body.card_number)
    return {"success": True, "data": result}


@router.get("/orders/{order_id}/status")
def get_order_status(
    order_id: str,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    return {"success": True, "data": payment_service.get_order_status(db, order_id)}
