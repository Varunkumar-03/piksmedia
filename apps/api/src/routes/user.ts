import express from 'express';
import { 
  getUsers, 
  createAdmin, 
  updateProfile,
  changePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../controllers/user';
import { protect, authorize } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = express.Router();

router.get('/', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), getUsers);
router.post('/admin', protect, authorize(UserRole.SUPER_ADMIN), createAdmin);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Address Management
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);
router.put('/addresses/:addressId/default', protect, setDefaultAddress);

export default router;
