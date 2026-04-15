require('../setup');
const request = require('supertest');
const app = require('../../src/app');
const { createUser, tokenFor, createCategory, createProduct } = require('../helpers');

describe('API /api/products', () => {
  let vendor, vendorToken, category;

  beforeEach(async () => {
    vendor = await createUser('vendeur');
    vendorToken = tokenFor(vendor);
    category = await createCategory();
  });

  describe('GET /api/products', () => {
    it('retourne la liste des produits', async () => {
      await createProduct(vendor.id, category.id);
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('filtre par catégorie', async () => {
      const cat2 = await createCategory('Livres');
      await createProduct(vendor.id, category.id);
      await createProduct(vendor.id, cat2.id);
      const res = await request(app).get(`/api/products?categoryId=${category.id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('GET /api/products/categories', () => {
    it('retourne les catégories', async () => {
      const res = await request(app).get('/api/products/categories');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/products/:id', () => {
    it('retourne le produit', async () => {
      const product = await createProduct(vendor.id);
      const res = await request(app).get(`/api/products/${product.id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(product.id);
    });

    it('retourne 404 si inexistant', async () => {
      const res = await request(app).get('/api/products/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/products', () => {
    it('refuse sans token', async () => {
      const res = await request(app).post('/api/products').send({ name: 'X', price: 10, stock: 5 });
      expect(res.status).toBe(401);
    });

    it('crée un produit (vendeur)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', vendorToken)
        .send({ name: 'Nouveau', description: 'Desc', price: 49.99, stock: 5, categoryId: category.id });
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Nouveau');
    });

    it('refuse un prix négatif', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', vendorToken)
        .send({ name: 'X', price: -5, stock: 5 });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('refuse la modification par un autre vendeur', async () => {
      const product = await createProduct(vendor.id);
      const other = await createUser('vendeur');
      const otherToken = tokenFor(other);
      const res = await request(app)
        .put(`/api/products/${product.id}`)
        .set('Authorization', otherToken)
        .send({ name: 'Hack', price: 1, stock: 1 });
      expect(res.status).toBe(403);
    });

    it('autorise la modification par le propriétaire', async () => {
      const product = await createProduct(vendor.id);
      const res = await request(app)
        .put(`/api/products/${product.id}`)
        .set('Authorization', vendorToken)
        .send({ name: 'Modifié', price: 99, stock: 3 });
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Modifié');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('supprime le produit (propriétaire)', async () => {
      const product = await createProduct(vendor.id);
      const res = await request(app)
        .delete(`/api/products/${product.id}`)
        .set('Authorization', vendorToken);
      expect(res.status).toBe(200);
    });
  });
});
