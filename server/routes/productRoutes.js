import express from 'express';
import { createProduct, getProducts, getFarmerProducts, updateProduct, deleteProduct } from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateProductFields } from '../middleware/productValidator.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('farmer'), validateProductFields, createProduct)
  .get(getProducts);

router.get('/farmer', protect, authorize('farmer'), getFarmerProducts);

router.route('/:id')
  .put(protect, authorize('farmer'), validateProductFields, updateProduct)
  .delete(protect, authorize('farmer', 'admin'), deleteProduct);

export default router;
