const productService = require('../../src/services/product.service');
const productRepository = require('../../src/repositories/product.repository');

jest.mock('../../src/repositories/product.repository');

describe('ProductService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getProductById', () => {
    it('devrait retourner le produit si trouvé', async () => {
      const mockProduct = { id: '1', name: 'Test', price: 10, stock: 5 };
      productRepository.findById.mockResolvedValue(mockProduct);

      const result = await productService.getProductById('1');
      expect(result).toEqual(mockProduct);
    });

    it('devrait lever une erreur 404 si non trouvé', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(productService.getProductById('999')).rejects.toMatchObject({
        status: 404,
        message: 'Produit introuvable',
      });
    });
  });

  describe('createProduct', () => {
    it('devrait rejeter un prix négatif', async () => {
      await expect(
        productService.createProduct({ name: 'X', price: -1, stock: 10 }, 'vendor1')
      ).rejects.toMatchObject({ status: 400 });
    });

    it('devrait rejeter un stock négatif', async () => {
      await expect(
        productService.createProduct({ name: 'X', price: 10, stock: -5 }, 'vendor1')
      ).rejects.toMatchObject({ status: 400 });
    });

    it('devrait créer le produit avec des données valides', async () => {
      const mockProduct = { id: '1', name: 'Produit A', price: 20, stock: 3 };
      productRepository.create.mockResolvedValue(mockProduct);

      const result = await productService.createProduct(
        { name: 'Produit A', price: 20, stock: 3 },
        'vendor1'
      );
      expect(result).toEqual(mockProduct);
      expect(productRepository.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateProduct', () => {
    it('devrait interdire la modification par un autre vendeur', async () => {
      productRepository.findById.mockResolvedValue({ id: '1', vendor_id: 'vendor-A' });

      await expect(
        productService.updateProduct('1', { price: 99 }, 'vendor-B', 'vendeur')
      ).rejects.toMatchObject({ status: 403 });
    });

    it('devrait autoriser la modification par un admin', async () => {
      productRepository.findById.mockResolvedValue({ id: '1', vendor_id: 'vendor-A' });
      productRepository.update.mockResolvedValue({ id: '1', price: 99 });

      const result = await productService.updateProduct('1', { price: 99 }, 'admin-id', 'admin');
      expect(result).toBeDefined();
    });
  });
});
