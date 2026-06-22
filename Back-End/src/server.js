// src/server.js
//
// Entry point. Wires together: env config, DB connection, middleware,
// and all route groups. Run with `npm run dev` (auto-restart) or
// `npm start` (plain node).

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

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`AutoTrack backend running on http://localhost:${PORT}`);
  });
}

startServer();