const productService = require('../services/product.service');

const getAll = async (req, res, next) => {
  try {
    const { vendorId, categoryId } = req.query;
    const products = await productService.getAllProducts({ vendorId, categoryId });
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, description, price, stock, categoryId } = req.body;
    const product = await productService.createProduct(
      { name, description, price, stock, categoryId },
      req.user.id
    );
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(
      req.params.id,
      req.body,
      req.user.id,
      req.user.role
    );
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, message: 'Produit supprimé' });
  } catch (err) {
    next(err);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await productService.getCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove, getCategories };
