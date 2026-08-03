import { Router } from 'express';
import { createOrder, getOrderById, getMyOrders, getAllOrders, updateOrderStatus, updateOrderToReturned, deleteOrder, updateOrderCustomization } from '../controllers/order';
import { protect, optionalProtect, authorize } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = Router();

// Admin & User Order Status routes
router.get('/', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), getAllOrders);
router.put('/:id/status', optionalProtect, updateOrderStatus);
router.put('/:id/return', optionalProtect, updateOrderToReturned);
router.put('/:id/customization', optionalProtect, updateOrderCustomization);
router.delete('/:id', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), deleteOrder);

// User routes
router.post('/', optionalProtect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', optionalProtect, getOrderById);

export default router;
