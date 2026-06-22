import { Router } from 'express';
import { getAuditLogs, getSystemInfo, getApiKeys, createApiKey, revokeApiKey, getSettings, updateSettings } from '../controllers/adminController';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('Admin'));

router.get('/logs', getAuditLogs);
router.get('/system-info', getSystemInfo);
router.get('/api-keys', getApiKeys);
router.post('/api-keys', createApiKey);
router.delete('/api-keys/:id', revokeApiKey);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
