from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.product import Product, Category
from models.user import User


class ProductRepository:

    def find_all(self, db: Session, vendor_id: Optional[str] = None, category_id: Optional[str] = None):
        query = (
            db.query(Product, User.name.label("vendor_name"), Category.name.label("category_name"))
            .join(User, Product.vendor_id == User.id)
            .outerjoin(Category, Product.category_id == Category.id)
            .filter(Product.stock > 0)
        )
        if vendor_id:
            query = query.filter(Product.vendor_id == vendor_id)
        if category_id:
            query = query.filter(Product.category_id == category_id)
        rows = query.order_by(Product.created_at.desc()).all()
        return [self._merge(p, vendor_name, category_name) for p, vendor_name, category_name in rows]

    def find_by_id(self, db: Session, product_id: str):
        row = (
            db.query(Product, User.name.label("vendor_name"), Category.name.label("category_name"))
            .join(User, Product.vendor_id == User.id)
            .outerjoin(Category, Product.category_id == Category.id)
            .filter(Product.id == product_id)
            .first()
        )
        if not row:
            return None
        return self._merge(row[0], row[1], row[2])

    def create(self, db: Session, name: str, description: Optional[str], price, stock: int,
               vendor_id: str, category_id: Optional[str]) -> Product:
        product = Product(
            name=name,
            description=description,
            price=price,
            stock=stock,
            vendor_id=vendor_id,
            category_id=category_id,
        )
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    def update(self, db: Session, product_id: str, **kwargs) -> Optional[Product]:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return None
        for key, value in kwargs.items():
            if value is not None:
                setattr(product, key, value)
        db.commit()
        db.refresh(product)
        return product

    def decrement_stock(self, db: Session, product_id: str, quantity: int) -> Optional[Product]:
        """Décrémentation atomique du stock (concurrent safe avec with_for_update)."""
        product = (
            db.query(Product)
            .filter(Product.id == product_id, Product.stock >= quantity)
            .with_for_update()
            .first()
        )
        if not product:
            return None
        product.stock -= quantity
        db.flush()
        return product

    def delete(self, db: Session, product_id: str):
        db.query(Product).filter(Product.id == product_id).delete()
        db.commit()

    def find_categories(self, db: Session):
        return db.query(Category).order_by(Category.name).all()

    @staticmethod
    def _merge(product: Product, vendor_name: str, category_name: Optional[str]) -> dict:
        """Retourne un dict avec les champs du produit + vendor_name + category_name."""
        data = {c.name: getattr(product, c.name) for c in product.__table__.columns}
        data["vendor_name"] = vendor_name
        data["category_name"] = category_name
        return data


product_repo = ProductRepository()
