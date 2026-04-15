const pool = require('../config/database');

class ProductRepository {
  async findAll({ vendorId, categoryId } = {}) {
    let query = `
      SELECT p.*, u.name as vendor_name, c.name as category_name
      FROM products p
      JOIN users u ON p.vendor_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.stock > 0
    `;
    const params = [];
    if (vendorId) {
      params.push(vendorId);
      query += ` AND p.vendor_id = $${params.length}`;
    }
    if (categoryId) {
      params.push(categoryId);
      query += ` AND p.category_id = $${params.length}`;
    }
    query += ' ORDER BY p.created_at DESC';
    const result = await pool.query(query, params);
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query(
      `SELECT p.*, u.name as vendor_name, c.name as category_name
       FROM products p
       JOIN users u ON p.vendor_id = u.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create({ name, description, price, stock, vendorId, categoryId }) {
    const result = await pool.query(
      `INSERT INTO products (name, description, price, stock, vendor_id, category_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description, price, stock, vendorId, categoryId]
    );
    return result.rows[0];
  }

  async update(id, { name, description, price, stock, categoryId }) {
    const result = await pool.query(
      `UPDATE products
       SET name = $1, description = $2, price = $3, stock = $4, category_id = $5, updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [name, description, price, stock, categoryId, id]
    );
    return result.rows[0] || null;
  }

  // Décrémentation de stock avec verrou (gestion concurrence)
  async decrementStock(id, quantity, client) {
    const db = client || pool;
    const result = await db.query(
      `UPDATE products
       SET stock = stock - $1
       WHERE id = $2 AND stock >= $1
       RETURNING id, stock`,
      [quantity, id]
    );
    return result.rows[0] || null;
  }

  async delete(id) {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
  }

  async findCategories() {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    return result.rows;
  }
}

module.exports = new ProductRepository();
