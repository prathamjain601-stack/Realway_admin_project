import { Router } from 'express';
import {
  createPost, getAllPosts, getPostById, updatePost, deletePost,
  createCategory, getAllCategories, updateCategory, deleteCategory
} from '../controllers/contentController';
import { authenticate, authorizeRoles } from '../middleware/auth';
import { auditLogger } from '../middleware/auditLogger';

const router = Router();

// Public read routes
router.get('/posts', getAllPosts);
router.get('/posts/:id', getPostById);
router.get('/categories', getAllCategories);

// Protected write routes
router.use(authenticate);
router.post('/posts', authorizeRoles('Admin', 'Manager'), auditLogger('Post', 'CREATE_POST'), createPost);
router.put('/posts/:id', authorizeRoles('Admin', 'Manager'), auditLogger('Post', 'UPDATE_POST'), updatePost);
router.delete('/posts/:id', authorizeRoles('Admin', 'Manager'), auditLogger('Post', 'DELETE_POST'), deletePost);
router.post('/categories', authorizeRoles('Admin'), auditLogger('Category', 'CREATE_CATEGORY'), createCategory);
router.put('/categories/:id', authorizeRoles('Admin'), auditLogger('Category', 'UPDATE_CATEGORY'), updateCategory);
router.delete('/categories/:id', authorizeRoles('Admin'), auditLogger('Category', 'DELETE_CATEGORY'), deleteCategory);

export default router;
