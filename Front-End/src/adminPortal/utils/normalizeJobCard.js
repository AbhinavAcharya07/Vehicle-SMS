/**
 * Maps the JobCard.js mongoose schema exactly:
 *   _id, vehiclePlateNumber, customerName, vehicleMakeModel, serviceType,
 *   assignedTechnician, estimatedCompletion, notes, admittedDate,
 *   releasedDate, progressStatus, progressPercent, billingStatus,
 *   chargeBreakdown, totalAmount, billSentAt, acceptedAt, closedAt,
 *   createdAt (from timestamps: true)
 *
 * Earlier bug: Dashboard/JobCards read `c.stage` / `c.vehicleName` /
 * `c.technicianName`, none of which exist on this doc — the real field
 * names are `progressStatus` / `vehicleMakeModel` / `assignedTechnician`.
 * This is the single place that translation happens now.
 */
export function normalizeJobCard(raw = {}) {
  return {
    id: raw._id || raw.id,
    plateNumber: raw.vehiclePlateNumber || "—",
    vehicleName: raw.vehicleMakeModel || "Unknown Vehicle",
    customerName: raw.customerName || "Unknown Customer",
    // schema defaults this to 'Unassigned' server-side, but keep a
    // client-side fallback too in case an old doc predates that default.
    technicianName: raw.assignedTechnician || "Unassigned",
    serviceType: raw.serviceType || "—",
    eta: raw.estimatedCompletion || null,
    notes: raw.notes || "",

    admittedDate: raw.admittedDate || null,
    releasedDate: raw.releasedDate || null,

    // progress state machine
    stage: raw.progressStatus || "queued",
    percentComplete: raw.progressPercent ?? 0,

    // billing state machine — independent of `stage`
    billingStatus: raw.billingStatus || "not_billed",
    chargeBreakdown: raw.chargeBreakdown || {
      technicianCharge: 0,
      serviceCharge: 0,
      partsCharge: 0,
      gst: 0,
    },
    totalAmount: raw.totalAmount ?? 0,
    billSentAt: raw.billSentAt || null,
    acceptedAt: raw.acceptedAt || null,
    closedAt: raw.closedAt || null,

    createdAt: raw.createdAt || null,
  };
}

export const normalizeJobCards = (list = []) => list.map(normalizeJobCard);


export function canPushToBilling(jobCard) {
  return jobCard.stage === "ready_for_pickup" && jobCard.billingStatus === "not_billed";
}