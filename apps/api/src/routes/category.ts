import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category';
import { protect, authorize } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = express.Router();

router.get('/', getCategories);

// All routes below require admin authentication
router.use(protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
