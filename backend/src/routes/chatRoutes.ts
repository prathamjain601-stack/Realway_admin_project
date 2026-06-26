import { Router } from 'express';
import { getChatHistory, sendMessage } from '../controllers/chatController';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('Admin', 'Manager'));

router.get('/history', getChatHistory);
router.post('/send', sendMessage);

export default router;
