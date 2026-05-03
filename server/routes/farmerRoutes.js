import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getDashboardStats, getFarmerProductsWithBids, getEarnings } from '../controllers/farmerController.js';

const router = express.Router();

router.use(protect, authorize('farmer'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/products', getFarmerProductsWithBids);
router.get('/earnings', getEarnings);

export default router;
