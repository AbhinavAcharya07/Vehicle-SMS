
import User from '../models/User.js';

const STAGE_LABEL = {
  queued: 'Queued',
  in_progress: 'In Progress',
  awaiting_parts: 'Awaiting Parts',
  ready_for_pickup: 'Ready for Pickup',
};

const STAGE_PERCENT = {
  queued: 0,
  in_progress: 50,
  awaiting_parts: 75,
  ready_for_pickup: 100,
};

const STAGE_ORDER = ['queued', 'in_progress', 'awaiting_parts', 'ready_for_pickup'];

function mostRecentJobCard(jobCards = []) {
  if (!jobCards.length) return null;
  return [...jobCards].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  )[0];
}

function derivePercent(jobCard) {
  const stored = jobCard.progressPercent;
  const fallback = STAGE_PERCENT[jobCard.progressStatus] ?? 0;
  if (!stored || stored === 0) return fallback;
  return stored;
}

function buildStages(progressStatus) {
  const currentIdx = STAGE_ORDER.indexOf(progressStatus);
  return STAGE_ORDER.map((key, i) => ({
    label: STAGE_LABEL[key],
    state:
      i < currentIdx ? 'done'
      : i === currentIdx ? 'current'
      : 'pending',
  }));
}


export async function getMyVehicle(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'customer') {
      return res.status(404).json({ message: 'No vehicle found' });
    }

    const latest = mostRecentJobCard(user.customer.jobCards);
    if (!latest) {
      return res.status(404).json({ message: 'No vehicle linked yet' });
    }

    
    if (latest.billingStatus === 'closed') {
      return res.status(404).json({ message: 'No active service' });
    }

    const parts = (latest.vehicleMakeModel || '').split(' ');
    const make  = parts[0] || '';
    const year  = parts[parts.length - 1] || '';
    const model = parts.slice(1, parts.length - 1).join(' ') || '';

    return res.json({
      id: latest.jobCardId,
      plateNumber: user.customer.licensePlateNumber,
      ownerName: user.customer.fullName,
      make,
      model,
      year,
      vehicleMakeModel: latest.vehicleMakeModel,
      status: STAGE_LABEL[latest.progressStatus] || 'Queued',
      currentServiceName: latest.serviceType,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function getServiceTracking(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'customer') {
      return res.status(404).json({ message: 'No tracking info found' });
    }

    const jobCard = (user.customer.jobCards || []).find(
      (jc) => String(jc.jobCardId) === String(req.params.id)
    );
    if (!jobCard) {
      return res.status(404).json({ message: 'No tracking info found' });
    }

    if (jobCard.billingStatus === 'closed') {
      return res.status(404).json({ message: 'Service completed' });
    }

    return res.json({
      status:          STAGE_LABEL[jobCard.progressStatus] || 'Queued',
      percentComplete: derivePercent(jobCard),
      technicianName:  jobCard.assignedTechnician || 'Unassigned',
      eta:             jobCard.estimatedCompletion || null,
      serviceName:     jobCard.serviceType,
      lastUpdate:      jobCard.updatedAt,
      stages:          buildStages(jobCard.progressStatus),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}


export async function getServiceHistory(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'customer') {
      return res.status(404).json({ message: 'No history found' });
    }

    const jobCards = user.customer.jobCards || [];

    const history = [...jobCards]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .map((jc) => ({
        id: jc.jobCardId,
        date: jc.admittedDate
          ? new Date(jc.admittedDate).toLocaleDateString('en-IN', {
              day:   '2-digit',
              month: 'short',
              year:  'numeric',
            })
          : '—',
        serviceName:    jc.serviceType          || '—',
        technicianName: jc.assignedTechnician   || 'Unassigned',
        cost:           jc.totalAmount          ?? 0,
        status:
          jc.billingStatus === 'closed' || jc.billingStatus === 'accepted'
            ? 'Completed'
            : STAGE_LABEL[jc.progressStatus] || 'In Progress',
      }));

    return res.json(history);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}