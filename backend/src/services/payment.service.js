const pool = require('../config/database');

// Statuts possibles d'une commande
const ORDER_STATUSES = ['en_attente', 'payee', 'expediee', 'livree', 'annulee'];

// Commission plateforme (10% par défaut)
const PLATFORM_COMMISSION = parseFloat(process.env.PLATFORM_COMMISSION) || 0.10;

class PaymentService {
  // Simulation de paiement
  async processPayment(orderId, { method = 'carte', cardNumber } = {}) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const orderResult = await client.query(
        'SELECT * FROM orders WHERE id = $1 FOR UPDATE',
        [orderId]
      );
      const order = orderResult.rows[0];

      if (!order) {
        const err = new Error('Commande introuvable');
        err.status = 404;
        throw err;
      }
      if (order.status !== 'en_attente') {
        const err = new Error('La commande ne peut pas être payée dans son état actuel');
        err.status = 400;
        throw err;
      }

      // Simulation : on accepte toujours le paiement (sauf carte invalide)
      if (method === 'carte' && cardNumber && cardNumber.startsWith('0000')) {
        const err = new Error('Paiement refusé (simulation)');
        err.status = 402;
        throw err;
      }

      const commission = parseFloat(order.total_amount) * PLATFORM_COMMISSION;
      const vendorAmount = parseFloat(order.total_amount) - commission;

      await client.query(
        `UPDATE orders SET status = 'payee', updated_at = NOW() WHERE id = $1`,
        [orderId]
      );

      await client.query(
        `INSERT INTO payments (order_id, amount, commission, vendor_amount, method, status)
         VALUES ($1, $2, $3, $4, $5, 'validee')`,
        [orderId, order.total_amount, commission, vendorAmount, method]
      );

      await client.query('COMMIT');

      return {
        orderId,
        status: 'payee',
        amount: order.total_amount,
        commission,
        vendorAmount,
        method,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getOrderStatus(orderId) {
    const result = await pool.query(
      `SELECT o.id, o.status, o.total_amount, o.created_at,
              p.method as payment_method, p.status as payment_status
       FROM orders o
       LEFT JOIN payments p ON p.order_id = o.id
       WHERE o.id = $1`,
      [orderId]
    );
    if (!result.rows[0]) {
      const err = new Error('Commande introuvable');
      err.status = 404;
      throw err;
    }
    return result.rows[0];
  }

  async updateOrderStatus(orderId, newStatus, userId, userRole) {
    if (!ORDER_STATUSES.includes(newStatus)) {
      const err = new Error(`Statut invalide : ${newStatus}`);
      err.status = 400;
      throw err;
    }

    const result = await pool.query(
      `UPDATE orders SET status = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [newStatus, orderId]
    );

    if (!result.rows[0]) {
      const err = new Error('Commande introuvable');
      err.status = 404;
      throw err;
    }
    return result.rows[0];
  }
}

module.exports = new PaymentService();
