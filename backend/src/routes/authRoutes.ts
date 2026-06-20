import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);

// Example of a protected route using RBAC
router.get('/me', authenticate, (req: any, res) => {
  res.json({ user: req.user });
});

router.get('/admin-only', authenticate, authorizeRoles('Admin'), (req: any, res) => {
  res.json({ message: 'Welcome Admin' });
});

export default router;
