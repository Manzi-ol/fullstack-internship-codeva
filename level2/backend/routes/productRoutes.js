const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  productValidation,
} = require('../controllers/productController');

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, productValidation, createProduct);
router.put('/:id', protect, productValidation, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
