import { Router } from 'express';
import { getMetrics } from '../controllers/metricController';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorizeRoles('Admin', 'Manager'), getMetrics);

export default router;
