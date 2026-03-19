const { validationResult, body } = require('express-validator');
const Product = require('../models/Product');
const Notification = require('../models/Notification');

// Validation rules
const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
];

// @desc    Get all products with pagination and sorting
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    // Build sort
    let sort = { createdAt: -1 }; // default: newest first
    if (req.query.sort) {
      const sortField = req.query.sort.startsWith('-')
        ? req.query.sort.substring(1)
        : req.query.sort;
      const sortOrder = req.query.sort.startsWith('-') ? -1 : 1;
      sort = { [sortField]: sortOrder };
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
const createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, description, price, category, inStock } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      inStock: inStock !== undefined ? inStock : true,
      createdBy: req.user.id,
    });

    await product.populate('createdBy', 'name email');

    // Create notification
    const notification = await Notification.create({
      message: `New product "${product.name}" was created by ${req.user.name}`,
      type: 'product_created',
      relatedProduct: product._id,
      createdBy: req.user.id,
    });

    // Emit socket event
    if (req.io) {
      req.io.emit('product_created', { product, notification });
    }

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Only creator or admin can update
    if (
      product.createdBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product',
      });
    }

    const { name, description, price, category, inStock } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;
    if (category !== undefined) updates.category = category;
    if (inStock !== undefined) updates.inStock = inStock;

    product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'name email');

    // Create notification
    const notification = await Notification.create({
      message: `Product "${product.name}" was updated by ${req.user.name}`,
      type: 'product_updated',
      relatedProduct: product._id,
      createdBy: req.user.id,
    });

    // Emit socket event
    if (req.io) {
      req.io.emit('product_updated', { product, notification });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Only creator or admin can delete
    if (
      product.createdBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    // Create notification
    const notification = await Notification.create({
      message: `Product "${product.name}" was deleted by ${req.user.name}`,
      type: 'product_deleted',
      createdBy: req.user.id,
    });

    // Emit socket event
    if (req.io) {
      req.io.emit('product_deleted', {
        productId: product._id,
        notification,
      });
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
