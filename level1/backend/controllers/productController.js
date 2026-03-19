const initialProducts = require("../data/products");

// In-memory product storage (seeded from data file)
let products = [...initialProducts];
let nextId = products.length + 1;

// @desc    Get all products
// @route   GET /api/products
const getAllProducts = (req, res) => {
  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
};

// @desc    Get a single product by ID
// @route   GET /api/products/:id
const getProductById = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: `Product with id ${id} not found`,
    });
  }

  res.status(200).json({
    success: true,
    data: product,
  });
};

// @desc    Create a new product
// @route   POST /api/products
const createProduct = (req, res) => {
  const { name, description, price, category, inStock } = req.body;

  // Validate required fields
  if (!name || !description || price === undefined || !category) {
    return res.status(400).json({
      success: false,
      message: "Please provide name, description, price, and category",
    });
  }

  if (typeof price !== "number" || price < 0) {
    return res.status(400).json({
      success: false,
      message: "Price must be a non-negative number",
    });
  }

  const newProduct = {
    id: nextId++,
    name,
    description,
    price,
    category,
    inStock: typeof inStock === "boolean" ? inStock : true,
  };

  products.push(newProduct);

  res.status(201).json({
    success: true,
    data: newProduct,
  });
};

// @desc    Update a product by ID
// @route   PUT /api/products/:id
const updateProduct = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Product with id ${id} not found`,
    });
  }

  const { name, description, price, category, inStock } = req.body;

  if (price !== undefined && (typeof price !== "number" || price < 0)) {
    return res.status(400).json({
      success: false,
      message: "Price must be a non-negative number",
    });
  }

  // Merge existing data with updates
  products[index] = {
    ...products[index],
    ...(name !== undefined && { name }),
    ...(description !== undefined && { description }),
    ...(price !== undefined && { price }),
    ...(category !== undefined && { category }),
    ...(inStock !== undefined && { inStock }),
  };

  res.status(200).json({
    success: true,
    data: products[index],
  });
};

// @desc    Delete a product by ID
// @route   DELETE /api/products/:id
const deleteProduct = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Product with id ${id} not found`,
    });
  }

  const removed = products.splice(index, 1);

  res.status(200).json({
    success: true,
    message: "Product deleted",
    data: removed[0],
  });
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
