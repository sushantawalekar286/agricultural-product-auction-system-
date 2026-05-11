import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { createOrder, getDealerOrders, getFarmerOrders, updateOrderStatus } from '../controllers/orderController.js';

const router = express.Router();

router.post('/create', protect, authorize('dealer'), createOrder);
router.get('/dealer', protect, authorize('dealer'), getDealerOrders);
router.get('/farmer', protect, authorize('farmer'), getFarmerOrders);
router.put('/update-status', protect, authorize('farmer', 'admin'), updateOrderStatus);

export default router;
