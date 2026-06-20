import { Router } from 'express';
import { createPost, getAllPosts, createCategory, getAllCategories } from '../controllers/contentController';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router = Router();

router.get('/posts', getAllPosts);
router.get('/categories', getAllCategories);

router.use(authenticate);
router.post('/posts', authorizeRoles('Admin', 'Manager'), createPost);
router.post('/categories', authorizeRoles('Admin', 'Manager'), createCategory);

export default router;
