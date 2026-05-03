import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getDealerDashboardStats, getDealerActiveAuctions, getDealerMyBids, getDealerWonAuctions } from '../controllers/dealerController.js';

const router = express.Router();

router.use(protect, authorize('dealer'));

router.get('/stats', getDealerDashboardStats);
router.get('/active-auctions', getDealerActiveAuctions);
router.get('/my-bids', getDealerMyBids);
router.get('/won-auctions', getDealerWonAuctions);

export default router;
