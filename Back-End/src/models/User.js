

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['customer', 'staff'],
      required: true,
    },

    
    passwordHash: {
      type: String,
      required: true,
    },

    
    customer: {
      fullName: { type: String, trim: true },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        sparse: true, 
      },
      phone: { type: String, trim: true },
      licensePlateNumber: {
        type: String,
        trim: true,
        uppercase: true,
        unique: true,
        sparse: true,
      },

      
      jobCards: [
        {
          jobCardId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobCard' },
          vehicleMakeModel: String,
          serviceType: String,
          
          assignedTechnician: String,
          estimatedCompletion: Date,
          progressStatus: String,
          progressPercent: Number,
          billingStatus: String,
          chargeBreakdown: {
            technicianCharge: Number,
            serviceCharge: Number,
            partsCharge: Number,
            gst: Number,
          },
          totalAmount: Number,
          admittedDate: Date,
          releasedDate: Date,
          billSentAt: Date,
          acceptedAt: Date,
          closedAt: Date,
          updatedAt: { type: Date, default: Date.now },
        },
      ],
    },

    staff: {
      adminGmail: {
        type: String,
        trim: true,
        lowercase: true,
      },
      staffGmail: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        sparse: true,
      },
      staffId: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
      },
    },

    
    resetOtp: {
      codeHash: { type: String, default: null },   
      expiresAt: { type: Date, default: null },
      verified: { type: Boolean, default: false },  
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;