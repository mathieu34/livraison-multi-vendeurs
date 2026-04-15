const pool = require('../config/database');

// Règle métier : max 10 livraisons actives par livreur
const MAX_DELIVERIES_PER_LIVREUR = 10;

class DeliveryRepository {
  async findById(id) {
    const result = await pool.query(
      `SELECT d.*,
              o.status as order_status,
              u.name as livreur_name, u.email as livreur_email
       FROM deliveries d
       JOIN orders o ON d.order_id = o.id
       LEFT JOIN users u ON d.livreur_id = u.id
       WHERE d.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findByOrderId(orderId) {
    const result = await pool.query(
      `SELECT d.*, u.name as livreur_name
       FROM deliveries d
       LEFT JOIN users u ON d.livreur_id = u.id
       WHERE d.order_id = $1`,
      [orderId]
    );
    return result.rows[0] || null;
  }

  async findByLivreur(livreurId) {
    const result = await pool.query(
      `SELECT d.*, o.total_amount
       FROM deliveries d
       JOIN orders o ON d.order_id = o.id
       WHERE d.livreur_id = $1
       ORDER BY d.created_at DESC`,
      [livreurId]
    );
    return result.rows;
  }

  async countActiveByLivreur(livreurId) {
    const result = await pool.query(
      `SELECT COUNT(*) FROM deliveries
       WHERE livreur_id = $1 AND status NOT IN ('livree', 'annulee')`,
      [livreurId]
    );
    return parseInt(result.rows[0].count, 10);
  }

  async isLivreurAvailable(livreurId) {
    const count = await this.countActiveByLivreur(livreurId);
    return count < MAX_DELIVERIES_PER_LIVREUR;
  }

  async create({ orderId, livreurId, address }) {
    const result = await pool.query(
      `INSERT INTO deliveries (order_id, livreur_id, address, status)
       VALUES ($1, $2, $3, 'en_attente')
       RETURNING *`,
      [orderId, livreurId, address]
    );
    return result.rows[0];
  }

  async updateStatus(id, status, { position } = {}) {
    const result = await pool.query(
      `UPDATE deliveries
       SET status = $1,
           current_position = COALESCE($2, current_position),
           delivered_at = CASE WHEN $1 = 'livree' THEN NOW() ELSE delivered_at END,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, position || null, id]
    );
    return result.rows[0] || null;
  }

  async findAvailableLivreurs() {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email,
              COUNT(d.id) FILTER (WHERE d.status NOT IN ('livree', 'annulee')) as active_deliveries
       FROM users u
       LEFT JOIN deliveries d ON d.livreur_id = u.id
       WHERE u.role = 'livreur'
       GROUP BY u.id, u.name, u.email
       HAVING COUNT(d.id) FILTER (WHERE d.status NOT IN ('livree', 'annulee')) < $1
       ORDER BY active_deliveries ASC`,
      [MAX_DELIVERIES_PER_LIVREUR]
    );
    return result.rows;
  }
}

module.exports = new DeliveryRepository();
