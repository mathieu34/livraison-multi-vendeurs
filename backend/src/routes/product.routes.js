const router = require('express').Router();
const ctrl = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Public
router.get('/', ctrl.getAll);
router.get('/categories', ctrl.getCategories);
router.get('/:id', ctrl.getById);

// Vendeur / Admin
router.post('/', authenticate, authorize('vendeur', 'admin'), ctrl.create);
router.put('/:id', authenticate, authorize('vendeur', 'admin'), ctrl.update);
router.delete('/:id', authenticate, authorize('vendeur', 'admin'), ctrl.remove);

module.exports = router;
