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

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
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

// Connect to DB at module load time — Vercel reads this synchronously
connectDB();

// Only bind a port when running locally (Vercel never reaches this)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`AutoTrack backend running on http://localhost:${PORT}`);
  });
}

// Vercel needs this — it wraps `app` as the Serverless Function handler
export default app;