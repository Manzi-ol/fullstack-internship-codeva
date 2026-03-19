const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// GET /api/products      - Get all products
// POST /api/products     - Create a new product
router.route("/").get(getAllProducts).post(createProduct);

// GET /api/products/:id    - Get single product
// PUT /api/products/:id    - Update product
// DELETE /api/products/:id - Delete product
router.route("/:id").get(getProductById).put(updateProduct).delete(deleteProduct);

module.exports = router;
