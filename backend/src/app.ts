import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import authRoutes from './modules/auth/auth.routes';
import vehicleRoutes from './modules/vehicles/vehicle.routes';
import driverRoutes from './modules/drivers/driver.routes';
import tripRoutes from './modules/trips/trip.routes';
import maintenanceRoutes from './modules/maintenance/maintenance.routes';
import fuelRoutes from './modules/fuel/fuel.routes';
import expenseRoutes from './modules/expenses/expense.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import userRoutes from './modules/users/user.routes';
import permissionRoutes from './modules/permissions/permission.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'TransitOps Backend Running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/permissions', permissionRoutes);

app.use(errorHandler);

export default app;
