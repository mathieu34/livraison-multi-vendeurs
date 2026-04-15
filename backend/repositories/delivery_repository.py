from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.delivery import Delivery, Order
from models.user import User

# Règle métier : max 10 livraisons actives par livreur
MAX_DELIVERIES_PER_LIVREUR = 10
INACTIVE_STATUSES = ("livree", "annulee")


class DeliveryRepository:

    def find_by_id(self, db: Session, delivery_id: str) -> Optional[dict]:
        row = (
            db.query(Delivery, Order.status.label("order_status"),
                     User.name.label("livreur_name"), User.email.label("livreur_email"))
            .join(Order, Delivery.order_id == Order.id)
            .outerjoin(User, Delivery.livreur_id == User.id)
            .filter(Delivery.id == delivery_id)
            .first()
        )
        if not row:
            return None
        d, order_status, livreur_name, livreur_email = row
        data = {c.name: getattr(d, c.name) for c in d.__table__.columns}
        data["order_status"] = order_status
        data["livreur_name"] = livreur_name
        data["livreur_email"] = livreur_email
        return data

    def find_by_order_id(self, db: Session, order_id: str) -> Optional[Delivery]:
        return db.query(Delivery).filter(Delivery.order_id == order_id).first()

    def find_by_livreur(self, db: Session, livreur_id: str):
        rows = (
            db.query(Delivery, Order.total_amount.label("total_amount"))
            .join(Order, Delivery.order_id == Order.id)
            .filter(Delivery.livreur_id == livreur_id)
            .order_by(Delivery.created_at.desc())
            .all()
        )
        result = []
        for d, total_amount in rows:
            data = {c.name: getattr(d, c.name) for c in d.__table__.columns}
            data["total_amount"] = total_amount
            result.append(data)
        return result

    def count_active_by_livreur(self, db: Session, livreur_id: str) -> int:
        return (
            db.query(func.count(Delivery.id))
            .filter(
                Delivery.livreur_id == livreur_id,
                Delivery.status.notin_(INACTIVE_STATUSES),
            )
            .scalar()
        )

    def is_livreur_available(self, db: Session, livreur_id: str) -> bool:
        return self.count_active_by_livreur(db, livreur_id) < MAX_DELIVERIES_PER_LIVREUR

    def create(self, db: Session, order_id: str, livreur_id: str, address: str) -> Delivery:
        delivery = Delivery(
            order_id=order_id,
            livreur_id=livreur_id,
            address=address,
            status="assignee",
        )
        db.add(delivery)
        db.commit()
        db.refresh(delivery)
        return delivery

    def update_status(self, db: Session, delivery_id: str, status: str,
                      position: Optional[str] = None) -> Optional[Delivery]:
        delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()
        if not delivery:
            return None
        delivery.status = status
        if position:
            delivery.current_position = position
        if status == "livree":
            from sqlalchemy.sql import func as sqlfunc
            delivery.delivered_at = sqlfunc.now()
        db.commit()
        db.refresh(delivery)
        return delivery

    def find_available_livreurs(self, db: Session):
        subq = (
            db.query(
                Delivery.livreur_id,
                func.count(Delivery.id).label("active_count"),
            )
            .filter(Delivery.status.notin_(INACTIVE_STATUSES))
            .group_by(Delivery.livreur_id)
            .subquery()
        )
        rows = (
            db.query(User, func.coalesce(subq.c.active_count, 0).label("active_deliveries"))
            .outerjoin(subq, User.id == subq.c.livreur_id)
            .filter(User.role == "livreur")
            .filter(func.coalesce(subq.c.active_count, 0) < MAX_DELIVERIES_PER_LIVREUR)
            .order_by("active_deliveries")
            .all()
        )
        return [
            {"id": u.id, "name": u.name, "email": u.email, "active_deliveries": int(count)}
            for u, count in rows
        ]


delivery_repo = DeliveryRepository()
