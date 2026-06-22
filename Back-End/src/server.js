import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { connectDB } from './config/db.js';
import customerRoutes from './routes/customerRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import passwordResetRoutes from './routes/passwordResetRoutes.js';
import jobCardRoutes from './AdminPortal/routes/jobCardRoutes.js';
import customerBillingRoutes from './AdminPortal/routes/customerBillingRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import billingActionsRouter from './AdminPortal/routes/billingActionsRoutes.js';

dotenv.config();

const app = express();

app.use(cors({ 
  origin: [
    'http://localhost:5173', 
    'https://vehicle-sms-a3ll.vercel.app' 
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));
app.use(express.json());

app.use('/api/vehicles', vehicleRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/auth', passwordResetRoutes);
app.use('/api/admin', jobCardRoutes);
app.use('/api/customer', customerBillingRoutes);
app.use('/api/billing', billingActionsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

connectDB();

const PORT = process.env.PORT || 5000;

// This will now run perfectly both locally and on Render
app.listen(PORT, '0.0.0.0', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`AutoTrack backend running on http://localhost:${PORT}`);
  } else {
    console.log(`AutoTrack backend live in production on port ${PORT}`);
  }
});

export default app;