const pool = require('../src/config/database');
const fs = require('fs');
const path = require('path');

beforeAll(async () => {
  const sql = fs.readFileSync(
    path.join(__dirname, '../../database/migrations/001_init.sql'),
    'utf8'
  );
  await pool.query(sql);
});

beforeEach(async () => {
  await pool.query(`
    TRUNCATE payments, deliveries, order_items, orders, products, categories, users
    RESTART IDENTITY CASCADE
  `);
});

afterAll(async () => {
  await pool.end();
});
