

import User from '../../models/User.js';

export async function syncJobCardToCustomer(jobCard) {
  const customerUser = await User.findById(jobCard.customerId);
  if (!customerUser) return; 

  const snapshot = {
    jobCardId: jobCard._id,
    vehicleMakeModel: jobCard.vehicleMakeModel,
    serviceType: jobCard.serviceType,
    
    assignedTechnician: jobCard.assignedTechnician,
    estimatedCompletion: jobCard.estimatedCompletion,
    progressStatus: jobCard.progressStatus,
    progressPercent: jobCard.progressPercent,
    billingStatus: jobCard.billingStatus,
    chargeBreakdown: jobCard.chargeBreakdown,
    totalAmount: jobCard.totalAmount,
    admittedDate: jobCard.admittedDate,
    releasedDate: jobCard.releasedDate,
    billSentAt: jobCard.billSentAt,
    acceptedAt: jobCard.acceptedAt,
    closedAt: jobCard.closedAt,
    updatedAt: new Date(),
  };

  const existingIndex = customerUser.customer.jobCards.findIndex(
    (jc) => String(jc.jobCardId) === String(jobCard._id)
  );

  if (existingIndex === -1) {
    customerUser.customer.jobCards.push(snapshot);
  } else {
    customerUser.customer.jobCards[existingIndex] = snapshot;
  }

  await customerUser.save();
}