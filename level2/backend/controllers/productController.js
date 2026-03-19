const { body, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Product = require('../models/Product');

/**
 * Validation rules for creating / updating a product.
 */
const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
];

/**
 * GET /api/products
 * Fetch all products. Supports ?category and ?search query params.
 */
const getProducts = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    const products = await Product.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /api/products/:id
 * Fetch a single product by ID.
 */
const getProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findById(req.params.id).populate(
      'createdBy',
      'name'
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * POST /api/products
 * Create a new product (authenticated users only).
 */
const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, description, price, category, inStock } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      inStock,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * PUT /api/products/:id
 * Update a product (admin or the creator only).
 */
const updateProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid product ID' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    let product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    }

    // Only admin or the creator can update
    if (
      req.user.role !== 'admin' &&
      product.createdBy?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product',
      });
    }

    const { name, description, price, category, inStock } = req.body;

    product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category, inStock },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * DELETE /api/products/:id
 * Delete a product (admin or the creator only).
 */
const deleteProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    }

    // Only admin or the creator can delete
    if (
      req.user.role !== 'admin' &&
      product.createdBy?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  productValidation,
};
