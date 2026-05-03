import express from 'express';
import { getDashboardStats, getFraudLogs, getAllAuctionsAdmin, getAllNotificationsAdmin, getAdminAuctionDetails, getAdminProductDetails } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/fraud-logs', getFraudLogs);
router.get('/auctions', getAllAuctionsAdmin);
router.get('/auctions/:id', getAdminAuctionDetails);
router.get('/products/:id', getAdminProductDetails);
router.get('/notifications', getAllNotificationsAdmin);

export default router;
