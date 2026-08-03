import { Router } from 'express';
import { getSizes, createSize, deleteSize } from '../controllers/size';
import { protect, authorize } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = Router();

router.get('/', getSizes);
router.post('/', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), createSize);
router.delete('/:id', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), deleteSize);

export default router;
