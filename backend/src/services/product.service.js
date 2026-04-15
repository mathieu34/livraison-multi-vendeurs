const productRepository = require('../repositories/product.repository');

class ProductService {
  async getAllProducts(filters = {}) {
    return productRepository.findAll(filters);
  }

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      const err = new Error('Produit introuvable');
      err.status = 404;
      throw err;
    }
    return product;
  }

  async createProduct({ name, description, price, stock, categoryId }, vendorId) {
    if (price <= 0) {
      const err = new Error('Le prix doit être supérieur à 0');
      err.status = 400;
      throw err;
    }
    if (stock < 0) {
      const err = new Error('Le stock ne peut pas être négatif');
      err.status = 400;
      throw err;
    }
    return productRepository.create({ name, description, price, stock, vendorId, categoryId });
  }

  async updateProduct(id, data, vendorId, userRole) {
    const product = await productRepository.findById(id);
    if (!product) {
      const err = new Error('Produit introuvable');
      err.status = 404;
      throw err;
    }
    // Seul le vendeur propriétaire ou un admin peut modifier
    if (userRole !== 'admin' && product.vendor_id !== vendorId) {
      const err = new Error('Non autorisé à modifier ce produit');
      err.status = 403;
      throw err;
    }
    return productRepository.update(id, data);
  }

  async deleteProduct(id, vendorId, userRole) {
    const product = await productRepository.findById(id);
    if (!product) {
      const err = new Error('Produit introuvable');
      err.status = 404;
      throw err;
    }
    if (userRole !== 'admin' && product.vendor_id !== vendorId) {
      const err = new Error('Non autorisé à supprimer ce produit');
      err.status = 403;
      throw err;
    }
    await productRepository.delete(id);
  }

  async getCategories() {
    return productRepository.findCategories();
  }
}

module.exports = new ProductService();
