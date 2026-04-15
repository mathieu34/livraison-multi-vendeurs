const pool = require('../src/config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const createUser = async (role = 'client') => {
  const hash = await bcrypt.hash('password123', 10);
  const res = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [`${role} test`, `${role}@test.com`, hash, role]
  );
  return res.rows[0];
};

const tokenFor = (user) =>
  `Bearer ${jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET)}`;

const createCategory = async (name = 'Électronique') => {
  const res = await pool.query(
    `INSERT INTO categories (name) VALUES ($1) RETURNING *`,
    [name]
  );
  return res.rows[0];
};

const createProduct = async (vendorId, categoryId = null) => {
  const res = await pool.query(
    `INSERT INTO products (name, description, price, stock, vendor_id, category_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    ['Produit test', 'Description', 29.99, 10, vendorId, categoryId]
  );
  return res.rows[0];
};

const createOrder = async (clientId) => {
  const res = await pool.query(
    `INSERT INTO orders (client_id, total_amount) VALUES ($1, $2) RETURNING *`,
    [clientId, 100.00]
  );
  return res.rows[0];
};

module.exports = { createUser, tokenFor, createCategory, createProduct, createOrder };
