
import JobCard from '../models/JobCard.js';
import User from '../../models/User.js';
import { syncJobCardToCustomer } from '../utils/syncJobCardToCustomer.js';

const DEFAULT_PERCENT_BY_STATUS = {
  queued: 0,
  in_progress: 50,
  awaiting_parts: 75,
  ready_for_pickup: 100,
};


export async function createJobCard(req, res) {
  try {
    const {
      vehiclePlateNumber,
      customerName,
      vehicleMakeModel,
      serviceType,
      assignedTechnician,
      estimatedCompletion,
      notes,
    } = req.body;

    if (!vehiclePlateNumber || !vehicleMakeModel || !serviceType) {
      return res.status(400).json({
        message: 'Vehicle plate number, make & model, and service type are required.',
      });
    }

    const normalizedPlate = vehiclePlateNumber.trim().toUpperCase();

    const customer = await User.findOne({
      role: 'customer',
      'customer.licensePlateNumber': normalizedPlate,
    });

    if (!customer) {
      return res.status(404).json({
        message: 'No registered customer found for this license plate. Ask the customer to register first.',
      });
    }

    const jobCard = await JobCard.create({
      vehiclePlateNumber: normalizedPlate,
      customerId: customer._id,
      customerName: customerName?.trim() || customer.customer.fullName,
      vehicleMakeModel: vehicleMakeModel.trim(),
      serviceType: serviceType.trim(),
      assignedTechnician: assignedTechnician?.trim() || 'Unassigned',
      estimatedCompletion: estimatedCompletion ? new Date(estimatedCompletion) : undefined,
      notes: notes?.trim(),
      progressStatus: 'queued',
      progressPercent: DEFAULT_PERCENT_BY_STATUS.queued,
      billingStatus: 'not_billed',
    });

    await syncJobCardToCustomer(jobCard);

    return res.status(201).json({ message: 'Job card created successfully.', jobCard });
  } catch (err) {
    console.error('createJobCard error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}


export async function listJobCards(req, res) {
  try {
    const jobCards = await JobCard.find({
      billingStatus: { $nin: ['closed'] },
    }).sort({ createdAt: -1 });
    return res.status(200).json({ jobCards });
  } catch (err) {
    console.error('listJobCards error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}


export async function getJobCard(req, res) {
  try {
    const jobCard = await JobCard.findById(req.params.id);
    if (!jobCard) return res.status(404).json({ message: 'Job card not found.' });
    return res.status(200).json({ jobCard });
  } catch (err) {
    console.error('getJobCard error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}


export async function updateProgress(req, res) {
  try {
    const {
      progressStatus,
      progressPercent,
      assignedTechnician,
      estimatedCompletion,
      serviceType,
    } = req.body;

    const validStatuses = ['queued', 'in_progress', 'awaiting_parts', 'ready_for_pickup'];
    if (!progressStatus || !validStatuses.includes(progressStatus)) {
      return res.status(400).json({
        message: `progressStatus must be one of: ${validStatuses.join(', ')}.`,
      });
    }

    const jobCard = await JobCard.findById(req.params.id);
    if (!jobCard) return res.status(404).json({ message: 'Job card not found.' });

    jobCard.progressStatus = progressStatus;
    jobCard.progressPercent =
      typeof progressPercent === 'number'
        ? progressPercent
        : DEFAULT_PERCENT_BY_STATUS[progressStatus];

    
    if (assignedTechnician !== undefined) {
      jobCard.assignedTechnician = assignedTechnician.trim() || 'Unassigned';
    }
    if (estimatedCompletion !== undefined) {
      jobCard.estimatedCompletion = estimatedCompletion
        ? new Date(estimatedCompletion)
        : null;
    }
    if (serviceType !== undefined && serviceType.trim()) {
      jobCard.serviceType = serviceType.trim();
    }

    if (progressStatus === 'ready_for_pickup' && !jobCard.releasedDate) {
      jobCard.releasedDate = new Date();
    }

    await jobCard.save();
    await syncJobCardToCustomer(jobCard); 

    return res.status(200).json({ message: 'Progress updated.', jobCard });
  } catch (err) {
    console.error('updateProgress error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}


export async function pushToBilling(req, res) {
  try {
    const jobCard = await JobCard.findById(req.params.id);
    if (!jobCard) return res.status(404).json({ message: 'Job card not found.' });

    if (jobCard.progressStatus !== 'ready_for_pickup') {
      return res.status(400).json({
        message: 'Only job cards that are Ready for Pickup can be pushed to billing.',
      });
    }
    if (jobCard.billingStatus !== 'not_billed') {
      return res.status(400).json({ message: 'This job card has already been pushed to billing.' });
    }

    jobCard.billingStatus = 'awaiting_bill';
    await jobCard.save();
    await syncJobCardToCustomer(jobCard);

    return res.status(200).json({ message: 'Pushed to billing.', jobCard });
  } catch (err) {
    console.error('pushToBilling error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}


export async function getBillingOverview(req, res) {
  try {
    const pending = await JobCard.find({
      billingStatus: { $in: ['awaiting_bill', 'bill_sent', 'accepted'] },
    }).sort({ updatedAt: -1 });

    const recentlySent = await JobCard.find({
      billingStatus: 'closed',
    }).sort({ updatedAt: -1 });

    return res.status(200).json({ pending, recentlySent });
  } catch (err) {
    console.error('getBillingOverview error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}


export async function saveBillingDraft(req, res) {
  try {
    const { technicianCharge = 0, serviceCharge = 0, partsCharge = 0, gst = 0 } = req.body;

    const jobCard = await JobCard.findById(req.params.id);
    if (!jobCard) return res.status(404).json({ message: 'Job card not found.' });

    jobCard.chargeBreakdown = { technicianCharge, serviceCharge, partsCharge, gst };
    jobCard.totalAmount =
      Number(technicianCharge) + Number(serviceCharge) + Number(partsCharge) + Number(gst);

    await jobCard.save();
    await syncJobCardToCustomer(jobCard);

    return res.status(200).json({ message: 'Draft saved.', jobCard });
  } catch (err) {
    console.error('saveBillingDraft error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}


export async function markDoneAndSend(req, res) {
  try {
    const { technicianCharge = 0, serviceCharge = 0, partsCharge = 0, gst = 0 } = req.body;

    const jobCard = await JobCard.findById(req.params.id);
    if (!jobCard) return res.status(404).json({ message: 'Job card not found.' });

    if (jobCard.billingStatus !== 'awaiting_bill') {
      return res.status(400).json({
        message: 'This job card is not awaiting a bill.',
      });
    }

    jobCard.chargeBreakdown = { technicianCharge, serviceCharge, partsCharge, gst };
    jobCard.totalAmount =
      Number(technicianCharge) + Number(serviceCharge) + Number(partsCharge) + Number(gst);
    jobCard.billingStatus = 'bill_sent';
    jobCard.billSentAt = new Date();

    await jobCard.save();
    await syncJobCardToCustomer(jobCard);

    return res.status(200).json({ message: 'Bill marked done and sent to customer.', jobCard });
  } catch (err) {
    console.error('markDoneAndSend error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}


export async function closeBilling(req, res) {
  try {
    const jobCard = await JobCard.findById(req.params.id);
    if (!jobCard) return res.status(404).json({ message: 'Job card not found.' });

    if (jobCard.billingStatus !== 'accepted') {
      return res.status(400).json({
        message: 'This bill has not been accepted by the customer yet.',
      });
    }

    jobCard.billingStatus = 'closed';
    jobCard.closedAt = new Date();

    await jobCard.save();
    await syncJobCardToCustomer(jobCard);

    return res.status(200).json({ message: 'Billing closed.', jobCard });
  } catch (err) {
    console.error('closeBilling error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}