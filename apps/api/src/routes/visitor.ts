import { Router } from 'express';
import { recordHit, getVisitorStats } from '../controllers/visitor';
import { protect, authorize } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = Router();

router.post('/hit', recordHit);
router.get('/stats', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), getVisitorStats);

export default router;
