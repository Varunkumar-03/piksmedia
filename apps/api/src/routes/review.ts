import { Router } from 'express';
import {
  createReview,
  getProductReviews,
  getAdminReviews,
  updateReviewStatus,
  deleteReview
} from '../controllers/review';
import { protect, authorize } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = Router();

// Public routes
router.post('/', createReview);
router.get('/product/:productId', getProductReviews);

// Admin routes
router.get('/admin', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), getAdminReviews);
router.put('/:id/status', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), updateReviewStatus);
router.delete('/:id', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), deleteReview);

export default router;
