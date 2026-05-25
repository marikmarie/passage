import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Import routes
import authRoutes from '../modules/auth/auth.routes';
import usersRoutes from '../modules/users/users.routes';
import ridersRoutes from '../modules/riders/riders.routes';
import devicesRoutes from '../modules/devices/devices.routes';
import trackingRoutes from '../modules/tracking/tracking.routes';
import tripsRoutes from '../modules/trips/trips.routes';
import geofencesRoutes from '../modules/geofences/geofences.routes';
import alertsRoutes from '../modules/alerts/alerts.routes';
import notificationsRoutes from '../modules/notifications/notifications.routes';
import paymentsRoutes from '../modules/payments/payments.routes';
import subscriptionsRoutes from '../modules/subscriptions/subscriptions.routes';
import reportsRoutes from '../modules/reports/reports.routes';
import adminRoutes from '../modules/admin/admin.routes';

// Import middleware
import { errorHandler } from '../middleware/errorHandler.middleware';
import { rateLimiter } from '../middleware/rateLimiter.middleware';

export const createApp = (): Application => {
  const app: Application = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));
  app.use(rateLimiter(15 * 60 * 1000, 100));

  // Serve the admin dashboard as static files
  app.use('/admin', express.static('admin-dashboard'));

  // Basic health check route
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'PASSAGE API is running' });
  });

  // API Routes (v1)
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', usersRoutes);
  app.use('/api/v1/riders', ridersRoutes);
  app.use('/api/v1/devices', devicesRoutes);
  app.use('/api/v1/tracking', trackingRoutes);
  app.use('/api/v1/trips', tripsRoutes);
  app.use('/api/v1/geofences', geofencesRoutes);
  app.use('/api/v1/alerts', alertsRoutes);
  app.use('/api/v1/notifications', notificationsRoutes);
  app.use('/api/v1/payments', paymentsRoutes);
  app.use('/api/v1/subscriptions', subscriptionsRoutes);
  app.use('/api/v1/reports', reportsRoutes);
  app.use('/api/v1/admin', adminRoutes);

  // Global Error handling middleware
  app.use(errorHandler);

  return app;
};
