import { Router } from 'express';
import { reportsController } from './reports.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const router = Router();

router.get('/daily-trips', authenticateToken, requireRole(['admin', 'support']), (req, res) => reportsController.getDailyTripsReport(req, res));
router.get('/sos-frequency', authenticateToken, requireRole(['admin', 'support']), (req, res) => reportsController.getSOSFrequencyReport(req, res));
router.get('/revenue', authenticateToken, requireRole(['admin']), (req, res) => reportsController.getRevenueReport(req, res));
router.get('/analytics', authenticateToken, requireRole(['admin']), (req, res) => reportsController.getAnalytics(req, res));

export default router;
