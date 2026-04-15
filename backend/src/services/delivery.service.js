const deliveryRepository = require('../repositories/delivery.repository');

// Transitions de statut autorisées
const STATUS_TRANSITIONS = {
  en_attente: ['assignee', 'annulee'],
  assignee: ['en_cours', 'annulee'],
  en_cours: ['livree', 'annulee'],
  livree: [],
  annulee: [],
};

class DeliveryService {
  async getDeliveryById(id) {
    const delivery = await deliveryRepository.findById(id);
    if (!delivery) {
      const err = new Error('Livraison introuvable');
      err.status = 404;
      throw err;
    }
    return delivery;
  }

  async getDeliveriesByLivreur(livreurId) {
    return deliveryRepository.findByLivreur(livreurId);
  }

  async getAvailableLivreurs() {
    return deliveryRepository.findAvailableLivreurs();
  }

  async assignLivreur(orderId, livreurId, address) {
    // Vérifier disponibilité du livreur (règle : max 10 livraisons actives)
    const isAvailable = await deliveryRepository.isLivreurAvailable(livreurId);
    if (!isAvailable) {
      const err = new Error('Ce livreur a atteint sa limite de livraisons actives (10 max)');
      err.status = 409;
      throw err;
    }

    const existing = await deliveryRepository.findByOrderId(orderId);
    if (existing) {
      const err = new Error('Une livraison existe déjà pour cette commande');
      err.status = 409;
      throw err;
    }

    const delivery = await deliveryRepository.create({ orderId, livreurId, address });
    return delivery;
  }

  async updateStatus(deliveryId, newStatus, { userId, userRole, position } = {}) {
    const delivery = await deliveryRepository.findById(deliveryId);
    if (!delivery) {
      const err = new Error('Livraison introuvable');
      err.status = 404;
      throw err;
    }

    // Vérifier que la transition est valide
    const allowed = STATUS_TRANSITIONS[delivery.status] || [];
    if (!allowed.includes(newStatus)) {
      const err = new Error(`Transition invalide : ${delivery.status} → ${newStatus}`);
      err.status = 400;
      throw err;
    }

    // Seul le livreur assigné ou un admin peut changer le statut
    if (userRole !== 'admin' && delivery.livreur_id !== userId) {
      const err = new Error('Non autorisé à modifier cette livraison');
      err.status = 403;
      throw err;
    }

    return deliveryRepository.updateStatus(deliveryId, newStatus, { position });
  }

  async trackDelivery(deliveryId) {
    return this.getDeliveryById(deliveryId);
  }
}

module.exports = new DeliveryService();
