const deliveryService = require('../services/delivery.service');
const paymentService = require('../services/payment.service');

const getById = async (req, res, next) => {
  try {
    const delivery = await deliveryService.getDeliveryById(req.params.id);
    res.json({ success: true, data: delivery });
  } catch (err) {
    next(err);
  }
};

const track = async (req, res, next) => {
  try {
    const delivery = await deliveryService.trackDelivery(req.params.id);
    res.json({ success: true, data: delivery });
  } catch (err) {
    next(err);
  }
};

const getMyDeliveries = async (req, res, next) => {
  try {
    const deliveries = await deliveryService.getDeliveriesByLivreur(req.user.id);
    res.json({ success: true, data: deliveries });
  } catch (err) {
    next(err);
  }
};

const getAvailableLivreurs = async (req, res, next) => {
  try {
    const livreurs = await deliveryService.getAvailableLivreurs();
    res.json({ success: true, data: livreurs });
  } catch (err) {
    next(err);
  }
};

const assign = async (req, res, next) => {
  try {
    const { orderId, livreurId, address } = req.body;
    const delivery = await deliveryService.assignLivreur(orderId, livreurId, address);
    res.status(201).json({ success: true, data: delivery });
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status, position } = req.body;
    const delivery = await deliveryService.updateStatus(req.params.id, status, {
      userId: req.user.id,
      userRole: req.user.role,
      position,
    });
    res.json({ success: true, data: delivery });
  } catch (err) {
    next(err);
  }
};

// Simulation paiement
const processPayment = async (req, res, next) => {
  try {
    const { orderId, method, cardNumber } = req.body;
    const result = await paymentService.processPayment(orderId, { method, cardNumber });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getOrderStatus = async (req, res, next) => {
  try {
    const result = await paymentService.getOrderStatus(req.params.orderId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getById,
  track,
  getMyDeliveries,
  getAvailableLivreurs,
  assign,
  updateStatus,
  processPayment,
  getOrderStatus,
};
