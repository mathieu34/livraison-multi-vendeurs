from fastapi import HTTPException
from sqlalchemy.orm import Session
from repositories.product_repository import ProductRepository, product_repo


class ProductService:

    def __init__(self, repo: ProductRepository = None):
        self.repo = repo or product_repo

    def get_all_products(self, db: Session, vendor_id=None, category_id=None):
        return self.repo.find_all(db, vendor_id=vendor_id, category_id=category_id)

    def get_product_by_id(self, db: Session, product_id: str):
        product = self.repo.find_by_id(db, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Produit introuvable")
        return product

    def create_product(self, db: Session, name: str, description, price, stock: int,
                       vendor_id: str, category_id=None):
        if float(price) <= 0:
            raise HTTPException(status_code=400, detail="Le prix doit être supérieur à 0")
        if stock < 0:
            raise HTTPException(status_code=400, detail="Le stock ne peut pas être négatif")
        return self.repo.create(db, name=name, description=description, price=price,
                                stock=stock, vendor_id=vendor_id, category_id=category_id)

    def update_product(self, db: Session, product_id: str, data: dict,
                       vendor_id: str, user_role: str):
        product = self.repo.find_by_id(db, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Produit introuvable")
        if user_role != "admin" and product["vendor_id"] != vendor_id:
            raise HTTPException(status_code=403, detail="Non autorisé à modifier ce produit")
        return self.repo.update(db, product_id, **{k: v for k, v in data.items() if v is not None})

    def delete_product(self, db: Session, product_id: str, vendor_id: str, user_role: str):
        product = self.repo.find_by_id(db, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Produit introuvable")
        if user_role != "admin" and product["vendor_id"] != vendor_id:
            raise HTTPException(status_code=403, detail="Non autorisé à supprimer ce produit")
        self.repo.delete(db, product_id)

    def get_categories(self, db: Session):
        return self.repo.find_categories(db)


product_service = ProductService()
