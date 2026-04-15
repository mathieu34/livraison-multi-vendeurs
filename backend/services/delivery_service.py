from fastapi import HTTPException
from sqlalchemy.orm import Session
from repositories.delivery_repository import DeliveryRepository, delivery_repo

# Transitions de statut autorisées
STATUS_TRANSITIONS = {
    "en_attente": ["assignee", "annulee"],
    "assignee": ["en_cours", "annulee"],
    "en_cours": ["livree", "annulee"],
    "livree": [],
    "annulee": [],
}


class DeliveryService:

    def __init__(self, repo: DeliveryRepository = None):
        self.repo = repo or delivery_repo

    def get_delivery_by_id(self, db: Session, delivery_id: str):
        delivery = self.repo.find_by_id(db, delivery_id)
        if not delivery:
            raise HTTPException(status_code=404, detail="Livraison introuvable")
        return delivery

    def get_deliveries_by_livreur(self, db: Session, livreur_id: str):
        return self.repo.find_by_livreur(db, livreur_id)

    def get_available_livreurs(self, db: Session):
        return self.repo.find_available_livreurs(db)

    def assign_livreur(self, db: Session, order_id: str, livreur_id: str, address: str):
        if not self.repo.is_livreur_available(db, livreur_id):
            raise HTTPException(
                status_code=409,
                detail="Ce livreur a atteint sa limite de livraisons actives (10 max)",
            )
        existing = self.repo.find_by_order_id(db, order_id)
        if existing:
            raise HTTPException(
                status_code=409,
                detail="Une livraison existe déjà pour cette commande",
            )
        return self.repo.create(db, order_id=order_id, livreur_id=livreur_id, address=address)

    def update_status(self, db: Session, delivery_id: str, new_status: str,
                      user_id: str = None, user_role: str = None, position: str = None):
        delivery = self.repo.find_by_id(db, delivery_id)
        if not delivery:
            raise HTTPException(status_code=404, detail="Livraison introuvable")

        allowed = STATUS_TRANSITIONS.get(delivery["status"], [])
        if new_status not in allowed:
            raise HTTPException(
                status_code=400,
                detail=f"Transition invalide : {delivery['status']} → {new_status}",
            )

        if user_role != "admin" and delivery["livreur_id"] != user_id:
            raise HTTPException(status_code=403, detail="Non autorisé à modifier cette livraison")

        return self.repo.update_status(db, delivery_id, new_status, position=position)

    def track_delivery(self, db: Session, delivery_id: str):
        return self.get_delivery_by_id(db, delivery_id)


delivery_service = DeliveryService()
