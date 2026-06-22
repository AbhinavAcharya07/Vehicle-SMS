

import express from 'express';
import { requireAuth } from '../../middleware/authMiddleware.js';
import { acceptBillByAuth } from '../controllers/customerBillingController.js';

const router = express.Router();

router.use(requireAuth);

router.post('/:jobCardId/accept', acceptBillByAuth);

export default router;