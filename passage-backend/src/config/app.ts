import express, { Application, Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Import routes
import authRoutes from '../modules/auth/auth.routes';
import usersRoutes from '../modules/users/users.routes';
import ridersRoutes from '../modules/riders/riders.routes';
import kidsRoutes from '../modules/kids/kids.routes';
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
import routePlanningRoutes from '../modules/route-planning/route-planning.routes';
import rideRequestsRoutes from '../modules/ride-requests/ride-requests.routes';
import watchRoutes from '../modules/watch/watch.routes';
import walletRoutes from '../modules/wallet/wallet.routes';

// Import middleware
import { errorHandler } from '../middleware/errorHandler.middleware';
import { rateLimiter } from '../middleware/rateLimiter.middleware';

const buildApiRouter = (): Router => {
  const router = Router();

  router.use('/auth', authRoutes);
  router.use('/users', usersRoutes);
  router.use('/riders', ridersRoutes);
  router.use('/kids', kidsRoutes);
  router.use('/devices', devicesRoutes);
  router.use('/tracking', trackingRoutes);
  router.use('/trips', tripsRoutes);
  router.use('/geofences', geofencesRoutes);
  router.use('/alerts', alertsRoutes);
  router.use('/notifications', notificationsRoutes);
  router.use('/payments', paymentsRoutes);
  router.use('/wallet', walletRoutes);
  router.use('/subscriptions', subscriptionsRoutes);
  router.use('/reports', reportsRoutes);
  router.use('/routes', routePlanningRoutes);
  router.use('/ride-requests', rideRequestsRoutes);
  router.use('/watch', watchRoutes);
  router.use('/admin', adminRoutes);

  return router;
};

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

  // Basic health check routes
  app.get(['/health', '/api/health', '/api/v1/health'], (req, res) => {
    res.status(200).json({
      success: true,
      status: 'healthy',
      platform: 'PASSAGE',
      message: 'PASSAGE API is running',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes. /api is the frontend contract; /api/v1 remains for backward compatibility.
  app.use('/api', buildApiRouter());
  app.use('/api/v1', buildApiRouter());

  // Global Error handling middleware
  app.use(errorHandler);

  return app;
};
