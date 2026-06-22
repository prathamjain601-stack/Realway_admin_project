import { Router } from 'express';
import { register, login, logout, refreshToken, verifyEmail, getMe } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', authenticate, logout);
router.post('/refresh-token', refreshToken);
router.get('/verify-email', verifyEmail);
router.get('/me', authenticate, getMe);

export default router;
