const router = require('express').Router();
const ctrl = require('../controllers/delivery.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Suivi public (client avec lien)
router.get('/:id/track', ctrl.track);

// Authentifié
router.get('/me', authenticate, authorize('livreur'), ctrl.getMyDeliveries);
router.get('/livreurs/available', authenticate, authorize('admin', 'vendeur'), ctrl.getAvailableLivreurs);
router.get('/:id', authenticate, ctrl.getById);

// Attribution d'un livreur (admin)
router.post('/', authenticate, authorize('admin'), ctrl.assign);

// Mise à jour statut (livreur ou admin)
router.patch('/:id/status', authenticate, authorize('livreur', 'admin'), ctrl.updateStatus);

// Paiement & statut commande
router.post('/payment', authenticate, ctrl.processPayment);
router.get('/orders/:orderId/status', authenticate, ctrl.getOrderStatus);

module.exports = router;
