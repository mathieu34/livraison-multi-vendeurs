from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.delivery import Order, OrderItem
from models.product import Product


class OrderService:

    def create_order(self, db: Session, items: list, client_id: str) -> Order:
        if not items:
            raise HTTPException(status_code=400, detail="Le panier est vide")

        total = 0.0
        validated = []

        for item in items:
            product = (
                db.query(Product)
                .filter(Product.id == item.product_id)
                .with_for_update()
                .first()
            )
            if not product:
                raise HTTPException(status_code=404, detail=f"Produit introuvable : {item.product_id}")
            if product.stock < item.quantity:
                raise HTTPException(status_code=400, detail=f"Stock insuffisant pour : {product.name}")
            total += float(product.price) * item.quantity
            validated.append((product, item.quantity))

        order = Order(client_id=client_id, total_amount=round(total, 2))
        db.add(order)
        db.flush()

        for product, quantity in validated:
            db.add(OrderItem(
                order_id=order.id,
                product_id=product.id,
                vendor_id=product.vendor_id,
                quantity=quantity,
                unit_price=product.price,
            ))
            product.stock -= quantity

        db.commit()
        db.refresh(order)
        return order

    def get_my_orders(self, db: Session, client_id: str):
        return (
            db.query(Order)
            .filter(Order.client_id == client_id)
            .order_by(Order.created_at.desc())
            .all()
        )

    def get_by_id(self, db: Session, order_id: str, user_id: str, user_role: str) -> Order:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Commande introuvable")
        if user_role != "admin" and order.client_id != user_id:
            raise HTTPException(status_code=403, detail="Non autorisé")
        return order

    def get_all(self, db: Session):
        return db.query(Order).order_by(Order.created_at.desc()).all()


order_service = OrderService()
