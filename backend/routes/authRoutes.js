import express from 'express';
import { registerUser, verifyOTP, loginUser, forgotPassword, resetPassword, getAllUsers, deleteUser, updateUserRole } from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/users', getAllUsers);
router.delete('/users/:id', protect, admin, deleteUser);
router.put('/users/:id/role', protect, admin, updateUserRole);

export default router;