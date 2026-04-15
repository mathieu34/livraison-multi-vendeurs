import os
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from models.delivery import Order
from models.payment import Payment

# Commission plateforme (10% par défaut)
PLATFORM_COMMISSION = float(os.getenv("PLATFORM_COMMISSION", "0.10"))

ORDER_STATUSES = ["en_attente", "payee", "expediee", "livree", "annulee"]


class PaymentService:

    def process_payment(self, db: Session, order_id: str, method: str = "carte",
                        card_number: str = None) -> dict:
        # SELECT FOR UPDATE pour éviter les doublons de paiement
        order = db.query(Order).filter(Order.id == order_id).with_for_update().first()
        if not order:
            raise HTTPException(status_code=404, detail="Commande introuvable")
        if order.status != "en_attente":
            raise HTTPException(
                status_code=400,
                detail="La commande ne peut pas être payée dans son état actuel",
            )

        # Simulation : carte commençant par 0000 → refusée
        if method == "carte" and card_number and card_number.startswith("0000"):
            raise HTTPException(status_code=402, detail="Paiement refusé (simulation)")

        amount = float(order.total_amount)
        commission = round(amount * PLATFORM_COMMISSION, 2)
        vendor_amount = round(amount - commission, 2)

        order.status = "payee"

        payment = Payment(
            order_id=order_id,
            amount=amount,
            commission=commission,
            vendor_amount=vendor_amount,
            method=method,
            status="validee",
        )
        db.add(payment)
        db.commit()

        return {
            "order_id": order_id,
            "status": "payee",
            "amount": amount,
            "commission": commission,
            "vendor_amount": vendor_amount,
            "method": method,
        }

    def get_order_status(self, db: Session, order_id: str) -> dict:
        row = (
            db.query(Order, Payment.method.label("payment_method"),
                     Payment.status.label("payment_status"))
            .outerjoin(Payment, Payment.order_id == Order.id)
            .filter(Order.id == order_id)
            .first()
        )
        if not row:
            raise HTTPException(status_code=404, detail="Commande introuvable")
        order, payment_method, payment_status = row
        return {
            "id": order.id,
            "status": order.status,
            "total_amount": float(order.total_amount),
            "created_at": str(order.created_at),
            "payment_method": payment_method,
            "payment_status": payment_status,
        }

    def update_order_status(self, db: Session, order_id: str, new_status: str) -> dict:
        if new_status not in ORDER_STATUSES:
            raise HTTPException(status_code=400, detail=f"Statut invalide : {new_status}")
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Commande introuvable")
        order.status = new_status
        db.commit()
        db.refresh(order)
        return {"id": order.id, "status": order.status}


payment_service = PaymentService()
