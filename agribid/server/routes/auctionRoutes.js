import express from 'express';
import { startAuction, getActiveAuctions, getAuctionDetails, stopAuction } from '../controllers/auctionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('admin'), startAuction)
  .get(getActiveAuctions);

router.get('/:id', getAuctionDetails);
router.put('/:id/stop', protect, authorize('admin'), stopAuction);

export default router;
