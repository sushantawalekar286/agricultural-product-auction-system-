import express from 'express';
import { placeBid, getBidsByProduct } from '../controllers/bidController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('dealer'), placeBid);
router.get('/:productId', getBidsByProduct);

export default router;
