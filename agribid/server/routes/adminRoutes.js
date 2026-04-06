import express from 'express';
import { getDashboardStats, getFraudLogs } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/fraud-logs', getFraudLogs);

export default router;
