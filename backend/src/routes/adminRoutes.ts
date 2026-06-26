import { Router } from 'express';
import {
  getAuditLogs, getSystemInfo, getApiKeys, createApiKey, revokeApiKey,
  getSettings, updateSettings,
  sendTestEmail,
  listBackupsEndpoint, createBackupEndpoint, restoreBackupEndpoint, deleteBackupEndpoint, downloadBackupEndpoint,
  getErrorLogs, clearErrorLogs,
  getRateLimitConfig, updateRateLimitConfig
} from '../controllers/adminController';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('Admin'));

// Existing
router.get('/logs', getAuditLogs);
router.get('/system-info', getSystemInfo);
router.get('/api-keys', getApiKeys);
router.post('/api-keys', createApiKey);
router.delete('/api-keys/:id', revokeApiKey);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Email
router.post('/test-email', sendTestEmail);

// Backups
router.get('/backups', listBackupsEndpoint);
router.post('/backups', createBackupEndpoint);
router.post('/backups/:filename/restore', restoreBackupEndpoint);
router.delete('/backups/:filename', deleteBackupEndpoint);
router.get('/backups/:filename/download', downloadBackupEndpoint);

// Error Logs
router.get('/error-logs', getErrorLogs);
router.delete('/error-logs', clearErrorLogs);

// Rate Limiting
router.get('/rate-limit-config', getRateLimitConfig);
router.put('/rate-limit-config', updateRateLimitConfig);

export default router;
