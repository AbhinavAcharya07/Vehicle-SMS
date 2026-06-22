

import express from 'express';
import {
  createJobCard,
  listJobCards,
  getJobCard,
  updateProgress,
  pushToBilling,
  getBillingOverview,
  saveBillingDraft,
  markDoneAndSend,
  closeBilling,
} from '../controllers/jobCardController.js';



const router = express.Router();

router.post('/job-cards', createJobCard);
router.get('/job-cards', listJobCards);
router.get('/job-cards/:id', getJobCard);
router.patch('/job-cards/:id/progress', updateProgress);
router.post('/job-cards/:id/push-to-billing', pushToBilling);

router.get('/billing', getBillingOverview);
router.patch('/job-cards/:id/save-draft', saveBillingDraft);
router.post('/job-cards/:id/mark-done-and-send', markDoneAndSend);
router.post('/job-cards/:id/close', closeBilling);

export default router;