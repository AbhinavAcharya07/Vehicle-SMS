
import express from 'express';
import {
  getMyJobCards,
  acceptBill,
} from '../controllers/customerBillingController.js';

const router = express.Router();

router.get('/:customerId/job-cards', getMyJobCards);
router.post('/job-cards/:jobCardId/accept-bill', acceptBill);

export default router;