import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  getMyVehicle,
  getServiceTracking,
  getServiceHistory,
} from '../controllers/vehicleController.js';
import {
  getLiveBilling,
  getRecentBilling,
  getMyRecentBilling,
} from '../AdminPortal/controllers/customerBillingController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/me', getMyVehicle);


router.get('/my/billing/recent', getMyRecentBilling);

router.get('/:id/tracking', getServiceTracking);
router.get('/:id/service-history', getServiceHistory);
router.get('/:jobCardId/billing/live', getLiveBilling);
router.get('/:jobCardId/billing/recent', getRecentBilling);

export default router;