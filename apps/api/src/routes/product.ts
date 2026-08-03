import { Router } from 'express';
import { getProducts, getProductById, createProduct, getCategories, createCategory, deleteProduct, updateProduct } from '../controllers/product';
import { protect, authorize } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = Router();

router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.post('/products', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), createProduct);
router.put('/products/:id', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), updateProduct);
router.delete('/products/:id', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), deleteProduct);

router.get('/categories', getCategories);
router.post('/categories', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), createCategory);

export default router;
