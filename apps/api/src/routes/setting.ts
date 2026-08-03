import { Router } from 'express';
import { 
  getHeroImages, updateHeroImages, 
  getLandingPageImages, updateLandingPageImages, 
  getTestimonials, updateTestimonials, 
  getFooterSettings, updateFooterSettings, 
  getLegalSettings, updateLegalSettings, 
  getDeliveryLocations, updateDeliveryLocations, 
  getWhyUsSettings, updateWhyUsSettings,
  getCoupons, updateCoupons,
  getOffers, updateOffers,
  getShippingReturnAddress, updateShippingReturnAddress
} from '../controllers/setting';
import { protect, authorize } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = Router();

router.get('/hero-images', getHeroImages);
router.put('/hero-images', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), updateHeroImages);

router.get('/landing-page-images', getLandingPageImages);
router.put('/landing-page-images', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), updateLandingPageImages);

router.get('/testimonials', getTestimonials);
router.put('/testimonials', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), updateTestimonials);

router.get('/footer', getFooterSettings);
router.put('/footer', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), updateFooterSettings);

router.get('/legal', getLegalSettings);
router.put('/legal', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), updateLegalSettings);

router.get('/delivery-locations', getDeliveryLocations);
router.put('/delivery-locations', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), updateDeliveryLocations);

router.get('/why-us', getWhyUsSettings);
router.put('/why-us', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), updateWhyUsSettings);

router.get('/coupons', getCoupons);
router.put('/coupons', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), updateCoupons);

router.get('/offers', getOffers);
router.put('/offers', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), updateOffers);

router.get('/shipping-return-address', getShippingReturnAddress);
router.put('/shipping-return-address', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), updateShippingReturnAddress);

export default router;
