import User from '../../models/User.js';
import JobCard from '../models/JobCard.js';
import { syncJobCardToCustomer } from '../utils/syncJobCardToCustomer.js';

export async function getMyJobCards(req, res) {
  try {
    const customer = await User.findOne({ _id: req.params.customerId, role: 'customer' });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }
    return res.status(200).json({ jobCards: customer.customer.jobCards });
  } catch (err) {
    console.error('getMyJobCards error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}

export async function getLiveBilling(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'customer') {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    const jc = (user.customer.jobCards || []).find(
      (j) => String(j.jobCardId) === String(req.params.jobCardId)
    );

    if (!jc) {
      return res.status(404).json({ message: 'No billing info found.' });
    }

    if (!['bill_sent', 'accepted'].includes(jc.billingStatus)) {
      return res.status(404).json({ message: 'No active bill yet.' });
    }

    return res.status(200).json({
      id:               jc.jobCardId,
      plateNumber:      user.customer.licensePlateNumber,
      vehicleLabel:     jc.vehicleMakeModel,
      serviceName:      jc.serviceType,
      serviceDate:      jc.billSentAt   || jc.updatedAt,
      admittedDate:     jc.admittedDate || null,
      releasedDate:     jc.releasedDate || null,
      technicianCharge: jc.chargeBreakdown?.technicianCharge ?? 0,
      serviceCharge:    jc.chargeBreakdown?.serviceCharge    ?? 0,
      partsCharge:      jc.chargeBreakdown?.partsCharge      ?? 0,
      gst:              jc.chargeBreakdown?.gst              ?? 0,
      total:            jc.totalAmount  ?? 0,
      status:
        jc.billingStatus === 'bill_sent'
          ? 'issued'
          : 'accepted_pending_admin',
    });
  } catch (err) {
    console.error('getLiveBilling error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}

export async function getRecentBilling(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'customer') {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    const closed = (user.customer.jobCards || [])
      .filter((jc) => jc.billingStatus === 'closed')
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .map((jc) => ({
        id:           jc.jobCardId,
        serviceName:  jc.serviceType,
        admittedDate: jc.admittedDate
          ? new Date(jc.admittedDate).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric',
            })
          : '—',
        releasedDate: jc.releasedDate
          ? new Date(jc.releasedDate).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric',
            })
          : '—',
        total: jc.totalAmount ?? 0,
      }));

    return res.status(200).json(closed);
  } catch (err) {
    console.error('getRecentBilling error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}

export async function acceptBillByAuth(req, res) {
  try {
    const jobCard = await JobCard.findById(req.params.jobCardId);
    if (!jobCard) {
      return res.status(404).json({ message: 'Job card not found.' });
    }

    if (String(jobCard.customerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    if (jobCard.billingStatus !== 'bill_sent') {
      return res.status(400).json({ message: 'This bill is not ready to be accepted yet.' });
    }

    jobCard.billingStatus = 'accepted';
    jobCard.acceptedAt = new Date();
    await jobCard.save();
    await syncJobCardToCustomer(jobCard);

    return res.status(200).json({ message: 'Bill accepted.', jobCard });
  } catch (err) {
    console.error('acceptBillByAuth error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}

export async function acceptBill(req, res) {
  try {
    const { customerId } = req.body;
    if (!customerId) {
      return res.status(400).json({ message: 'customerId is required.' });
    }

    const jobCard = await JobCard.findById(req.params.jobCardId);
    if (!jobCard) {
      return res.status(404).json({ message: 'Job card not found.' });
    }

    if (String(jobCard.customerId) !== String(customerId)) {
      return res.status(403).json({ message: 'You are not authorized to act on this job card.' });
    }

    if (jobCard.billingStatus !== 'bill_sent') {
      return res.status(400).json({ message: 'This bill is not ready to be accepted yet.' });
    }

    jobCard.billingStatus = 'accepted';
    jobCard.acceptedAt = new Date();
    await jobCard.save();
    await syncJobCardToCustomer(jobCard);

    return res.status(200).json({ message: 'Bill accepted.', jobCard });
  } catch (err) {
    console.error('acceptBill error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}


export async function getMyRecentBilling(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'customer') {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    const closed = (user.customer.jobCards || [])
      .filter((jc) => ['closed', 'accepted'].includes(jc.billingStatus))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .map((jc) => ({
        id:              jc.jobCardId,
        serviceType:     jc.serviceType,
        vehicleMakeModel: jc.vehicleMakeModel,
        vehiclePlateNumber: user.customer.licensePlateNumber,
        admittedDate:    jc.admittedDate
          ? new Date(jc.admittedDate).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric',
            })
          : '—',
        releasedDate:    jc.releasedDate
          ? new Date(jc.releasedDate).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric',
            })
          : '—',
        totalAmount:     jc.totalAmount ?? 0,
        billingStatus:   jc.billingStatus,
      }));

    return res.status(200).json(closed);
  } catch (err) {
    console.error('getMyRecentBilling error:', err);
    return res.status(500).json({ message: 'Failed to fetch billing history.' });
  }
}