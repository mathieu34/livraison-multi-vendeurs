import os
import uuid
from passlib.context import CryptContext
from jose import jwt
from sqlalchemy.orm import Session
from models.user import User
from models.product import Category, Product
from models.delivery import Order, Delivery

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = os.getenv("JWT_SECRET", "test_secret")


def create_user(db: Session, role: str = "client") -> User:
    user = User(
        name=f"{role} test",
        email=f"{role}_{uuid.uuid4().hex[:6]}@test.com",
        password_hash=pwd_context.hash("password123"),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def token_for(user: User) -> str:
    payload = {"id": user.id, "role": user.role}
    return f"Bearer {jwt.encode(payload, JWT_SECRET, algorithm='HS256')}"


def create_category(db: Session, name: str = None) -> Category:
    cat = Category(name=name or f"Categorie_{uuid.uuid4().hex[:6]}")
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


def create_product(db: Session, vendor_id: str, category_id: str = None) -> Product:
    product = Product(
        name="Produit test",
        description="Description",
        price=29.99,
        stock=10,
        vendor_id=vendor_id,
        category_id=category_id,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def create_order(db: Session, client_id: str) -> Order:
    order = Order(client_id=client_id, total_amount=100.00)
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


def create_delivery(db: Session, order_id: str, livreur_id: str,
                    address: str = "1 rue Test", status: str = "en_attente") -> Delivery:
    delivery = Delivery(order_id=order_id, livreur_id=livreur_id,
                        address=address, status=status)
    db.add(delivery)
    db.commit()
    db.refresh(delivery)
    return delivery
