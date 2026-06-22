import { Router } from 'express';
import { getAllUsers, getUserById, updateUser, changePassword, deleteUser, bulkImport, getUserActivity } from '../controllers/userController';
import { authenticate, authorizeRoles } from '../middleware/auth';
import { auditLogger } from '../middleware/auditLogger';
import { csvUpload } from '../config/multerConfig';

const router = Router();

router.use(authenticate);

router.get('/', authorizeRoles('Admin', 'Manager'), getAllUsers);
router.get('/:id', authorizeRoles('Admin', 'Manager'), getUserById);
router.get('/:id/activity', authorizeRoles('Admin', 'Manager'), getUserActivity);
router.put('/:id', authorizeRoles('Admin', 'Manager'), auditLogger('User'), updateUser);
router.put('/:id/password', authenticate, auditLogger('User', 'CHANGE_PASSWORD'), changePassword);
router.delete('/:id', authorizeRoles('Admin'), auditLogger('User', 'DELETE_USER'), deleteUser);
router.post('/bulk-import', authorizeRoles('Admin'), csvUpload.single('file'), auditLogger('User', 'BULK_IMPORT'), bulkImport);

export default router;
