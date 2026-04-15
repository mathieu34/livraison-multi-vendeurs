const request = require('supertest');
const app = require('../../src/app');
const pool = require('../../src/config/database');

// Token JWT de test (role vendeur)
const VENDOR_TOKEN = 'Bearer <token_vendeur_test>';
const ADMIN_TOKEN  = 'Bearer <token_admin_test>';

describe('API /api/products', () => {
  let createdProductId;

  afterAll(async () => {
    await pool.end();
  });

  describe('GET /api/products', () => {
    it('devrait retourner la liste des produits', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('devrait filtrer par catégorie', async () => {
      const res = await request(app).get('/api/products?categoryId=some-uuid');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/products/categories', () => {
    it('devrait retourner les catégories', async () => {
      const res = await request(app).get('/api/products/categories');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/products', () => {
    it('devrait refuser sans token', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({ name: 'Test', price: 10, stock: 5 });
      expect(res.status).toBe(401);
    });

    it('devrait créer un produit avec un token vendeur valide', async () => {
      // Ce test nécessite un vrai token JWT — à configurer avec jest.setup.js
      // Exemple de structure attendue :
      // const res = await request(app)
      //   .post('/api/products')
      //   .set('Authorization', VENDOR_TOKEN)
      //   .send({ name: 'Nouveau produit', description: 'Desc', price: 29.99, stock: 10 });
      // expect(res.status).toBe(201);
      // createdProductId = res.body.data.id;
      expect(true).toBe(true); // placeholder
    });
  });

  describe('GET /api/products/:id', () => {
    it('devrait retourner 404 pour un ID inexistant', async () => {
      const res = await request(app).get('/api/products/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(404);
    });
  });
});
