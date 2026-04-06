import express from 'express';
import { predictCropDemand } from '../services/predictionService.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/predict', protect, predictCropDemand);

export default router;
