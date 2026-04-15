require('../setup');
const request = require('supertest');
const app = require('../../src/app');
const pool = require('../../src/config/database');
const { createUser, tokenFor, createOrder } = require('../helpers');

describe('API /api/deliveries', () => {
  let admin, adminToken, livreur, livreurToken, client, order;

  beforeEach(async () => {
    admin   = await createUser('admin');
    livreur = await createUser('livreur');
    client  = await createUser('client');
    adminToken   = tokenFor(admin);
    livreurToken = tokenFor(livreur);
    order = await createOrder(client.id);
  });

  describe('POST /api/deliveries (attribution)', () => {
    it('refuse sans token', async () => {
      const res = await request(app).post('/api/deliveries').send({});
      expect(res.status).toBe(401);
    });

    it('refuse sans role admin', async () => {
      const res = await request(app)
        .post('/api/deliveries')
        .set('Authorization', livreurToken)
        .send({ orderId: order.id, livreurId: livreur.id, address: '1 rue Test' });
      expect(res.status).toBe(403);
    });

    it('crée une livraison (admin)', async () => {
      const res = await request(app)
        .post('/api/deliveries')
        .set('Authorization', adminToken)
        .send({ orderId: order.id, livreurId: livreur.id, address: '1 rue Test' });
      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('en_attente');
    });

    it('refuse si livraison déjà existante pour cette commande', async () => {
      await request(app)
        .post('/api/deliveries')
        .set('Authorization', adminToken)
        .send({ orderId: order.id, livreurId: livreur.id, address: '1 rue Test' });

      const res = await request(app)
        .post('/api/deliveries')
        .set('Authorization', adminToken)
        .send({ orderId: order.id, livreurId: livreur.id, address: '2 rue Test' });
      expect(res.status).toBe(409);
    });

    it('refuse si livreur a 10 livraisons actives', async () => {
      // Créer 10 commandes et livraisons actives pour ce livreur
      for (let i = 0; i < 10; i++) {
        const o = await createOrder(client.id);
        await pool.query(
          `INSERT INTO deliveries (order_id, livreur_id, address, status)
           VALUES ($1, $2, $3, 'assignee')`,
          [o.id, livreur.id, `${i} rue Test`]
        );
      }
      const newOrder = await createOrder(client.id);
      const res = await request(app)
        .post('/api/deliveries')
        .set('Authorization', adminToken)
        .send({ orderId: newOrder.id, livreurId: livreur.id, address: '99 rue Test' });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/deliveries/:id/track', () => {
    it('retourne la livraison', async () => {
      const created = await pool.query(
        `INSERT INTO deliveries (order_id, livreur_id, address) VALUES ($1, $2, $3) RETURNING *`,
        [order.id, livreur.id, '1 rue Test']
      );
      const id = created.rows[0].id;
      const res = await request(app).get(`/api/deliveries/${id}/track`);
      expect(res.status).toBe(200);
    });

    it('retourne 404 si inexistante', async () => {
      const res = await request(app).get('/api/deliveries/00000000-0000-0000-0000-000000000000/track');
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/deliveries/:id/status', () => {
    let deliveryId;

    beforeEach(async () => {
      const res = await pool.query(
        `INSERT INTO deliveries (order_id, livreur_id, address, status)
         VALUES ($1, $2, $3, 'assignee') RETURNING *`,
        [order.id, livreur.id, '1 rue Test']
      );
      deliveryId = res.rows[0].id;
    });

    it('livreur peut passer assignee → en_cours', async () => {
      const res = await request(app)
        .patch(`/api/deliveries/${deliveryId}/status`)
        .set('Authorization', livreurToken)
        .send({ status: 'en_cours' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('en_cours');
    });

    it('refuse une transition invalide (livree → en_cours)', async () => {
      await pool.query(`UPDATE deliveries SET status = 'livree' WHERE id = $1`, [deliveryId]);
      const res = await request(app)
        .patch(`/api/deliveries/${deliveryId}/status`)
        .set('Authorization', livreurToken)
        .send({ status: 'en_cours' });
      expect(res.status).toBe(400);
    });

    it('refuse si mauvais livreur', async () => {
      const other = await createUser('livreur');
      const res = await request(app)
        .patch(`/api/deliveries/${deliveryId}/status`)
        .set('Authorization', tokenFor(other))
        .send({ status: 'en_cours' });
      expect(res.status).toBe(403);
    });
  });
});
