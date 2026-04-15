const deliveryService = require('../../src/services/delivery.service');
const deliveryRepository = require('../../src/repositories/delivery.repository');

jest.mock('../../src/repositories/delivery.repository');

describe('DeliveryService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('assignLivreur', () => {
    it('devrait rejeter si le livreur a atteint la limite (10 livraisons)', async () => {
      deliveryRepository.isLivreurAvailable.mockResolvedValue(false);

      await expect(
        deliveryService.assignLivreur('order-1', 'livreur-1', '1 rue Test')
      ).rejects.toMatchObject({ status: 409 });
    });

    it('devrait rejeter si une livraison existe déjà pour cette commande', async () => {
      deliveryRepository.isLivreurAvailable.mockResolvedValue(true);
      deliveryRepository.findByOrderId.mockResolvedValue({ id: 'existing-delivery' });

      await expect(
        deliveryService.assignLivreur('order-1', 'livreur-1', '1 rue Test')
      ).rejects.toMatchObject({ status: 409 });
    });

    it('devrait créer la livraison si le livreur est disponible', async () => {
      deliveryRepository.isLivreurAvailable.mockResolvedValue(true);
      deliveryRepository.findByOrderId.mockResolvedValue(null);
      deliveryRepository.create.mockResolvedValue({ id: 'new-delivery', status: 'en_attente' });

      const result = await deliveryService.assignLivreur('order-1', 'livreur-1', '1 rue Test');
      expect(result.id).toBe('new-delivery');
    });
  });

  describe('updateStatus', () => {
    it('devrait rejeter une transition de statut invalide', async () => {
      deliveryRepository.findById.mockResolvedValue({
        id: 'd1',
        status: 'livree',
        livreur_id: 'l1',
      });

      await expect(
        deliveryService.updateStatus('d1', 'en_cours', { userId: 'l1', userRole: 'livreur' })
      ).rejects.toMatchObject({ status: 400 });
    });

    it('devrait rejeter si le livreur n\'est pas assigné', async () => {
      deliveryRepository.findById.mockResolvedValue({
        id: 'd1',
        status: 'assignee',
        livreur_id: 'livreur-A',
      });

      await expect(
        deliveryService.updateStatus('d1', 'en_cours', { userId: 'livreur-B', userRole: 'livreur' })
      ).rejects.toMatchObject({ status: 403 });
    });

    it('devrait autoriser la transition assignee → en_cours par le bon livreur', async () => {
      deliveryRepository.findById.mockResolvedValue({
        id: 'd1',
        status: 'assignee',
        livreur_id: 'livreur-A',
      });
      deliveryRepository.updateStatus.mockResolvedValue({ id: 'd1', status: 'en_cours' });

      const result = await deliveryService.updateStatus('d1', 'en_cours', {
        userId: 'livreur-A',
        userRole: 'livreur',
      });
      expect(result.status).toBe('en_cours');
    });
  });
});
