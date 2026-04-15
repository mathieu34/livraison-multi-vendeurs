from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from middlewares.auth import get_current_user, require_roles
from services.product_service import product_service
from schemas.product import ProductCreate, ProductUpdate

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("")
def get_all(
    vendor_id: Optional[str] = None,
    category_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return {"success": True, "data": product_service.get_all_products(db, vendor_id, category_id)}


@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    cats = product_service.get_categories(db)
    return {"success": True, "data": [{"id": c.id, "name": c.name} for c in cats]}


@router.get("/{product_id}")
def get_by_id(product_id: str, db: Session = Depends(get_db)):
    return {"success": True, "data": product_service.get_product_by_id(db, product_id)}


@router.post("", status_code=201)
def create(
    body: ProductCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("vendeur", "admin")),
):
    product = product_service.create_product(
        db,
        name=body.name,
        description=body.description,
        price=body.price,
        stock=body.stock,
        vendor_id=user["id"],
        category_id=body.category_id,
    )
    return {"success": True, "data": product}


@router.put("/{product_id}")
def update(
    product_id: str,
    body: ProductUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("vendeur", "admin")),
):
    product = product_service.update_product(
        db, product_id, body.model_dump(exclude_none=True), user["id"], user["role"]
    )
    return {"success": True, "data": product}


@router.delete("/{product_id}")
def delete(
    product_id: str,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("vendeur", "admin")),
):
    product_service.delete_product(db, product_id, user["id"], user["role"])
    return {"success": True, "message": "Produit supprimé"}
