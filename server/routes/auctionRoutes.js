import express from 'express';
import { startAuction, getActiveAuctions, getAuctionDetails, stopAuction, extendAuction } from '../controllers/auctionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('admin'), startAuction)
  .get(getActiveAuctions);

router.get('/:id', getAuctionDetails);
router.put('/:id/stop', protect, authorize('admin'), stopAuction);
router.put('/:id/extend', protect, authorize('admin'), extendAuction);

export default router;
