import { Router } from 'express';
import { getDashboardMetrics, getUserGrowth, getSystemHealthEndpoint, getRecentActivity, getMetrics, exportMetrics } from '../controllers/metricController';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('Admin', 'Manager'));

router.get('/dashboard', getDashboardMetrics);
router.get('/user-growth', getUserGrowth);
router.get('/system-health', getSystemHealthEndpoint);
router.get('/recent-activity', getRecentActivity);
router.get('/export', exportMetrics);
router.get('/', getMetrics);

export default router;
