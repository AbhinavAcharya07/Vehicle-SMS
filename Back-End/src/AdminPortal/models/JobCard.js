
import mongoose from 'mongoose';

const jobCardSchema = new mongoose.Schema(
  {
    vehiclePlateNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true, 
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerName: { type: String, trim: true }, // denormalized for quick display

    vehicleMakeModel: { type: String, trim: true, required: true },
    serviceType: { type: String, trim: true, required: true },
    assignedTechnician: { type: String, trim: true, default: 'Unassigned' },
    estimatedCompletion: { type: Date },
    notes: { type: String, trim: true },

    admittedDate: { type: Date, default: Date.now },
    releasedDate: { type: Date, default: null }, 

    progressStatus: {
      type: String,
      enum: ['queued', 'in_progress', 'awaiting_parts', 'ready_for_pickup'],
      default: 'queued',
    },
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },

    billingStatus: {
      type: String,
      enum: ['not_billed', 'awaiting_bill', 'bill_sent', 'accepted', 'closed'],
      default: 'not_billed',
    },

    chargeBreakdown: {
      technicianCharge: { type: Number, default: 0 },
      serviceCharge: { type: Number, default: 0 },
      partsCharge: { type: Number, default: 0 },
      gst: { type: Number, default: 0 },
    },
    totalAmount: { type: Number, default: 0 },

    billSentAt: { type: Date, default: null },    
    acceptedAt: { type: Date, default: null },      
    closedAt: { type: Date, default: null },        
  },
  { timestamps: true }
);

const JobCard = mongoose.model('JobCard', jobCardSchema);
export default JobCard;