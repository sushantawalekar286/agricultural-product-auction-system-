import express from 'express';
import { registerUser, loginUser, getUsers, blockUser, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', protect, authorize('admin'), getUsers);
router.put('/:id/block', protect, authorize('admin'), blockUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;
