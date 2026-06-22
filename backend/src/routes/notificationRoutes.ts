import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead, createNotification } from '../controllers/notificationController';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.post('/', authorizeRoles('Admin'), createNotification);

export default router;
