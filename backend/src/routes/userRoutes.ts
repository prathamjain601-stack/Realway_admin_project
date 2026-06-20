import { Router } from 'express';
import { getAllUsers, getUserById, deleteUser } from '../controllers/userController';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', authorizeRoles('Admin', 'Manager'), getAllUsers);
router.get('/:id', authorizeRoles('Admin', 'Manager'), getUserById);
router.delete('/:id', authorizeRoles('Admin'), deleteUser);

export default router;
