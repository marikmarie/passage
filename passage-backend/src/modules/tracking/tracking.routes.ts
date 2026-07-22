import { Router } from 'express';
import { trackingController } from './tracking.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const router = Router();

router.get('/latest/:deviceId', authenticateToken, requireRole(['parent', 'rider', 'admin', 'support']), (req, res) => trackingController.getLatestLocation(req, res));
router.get('/history/:deviceId', authenticateToken, requireRole(['parent', 'rider', 'admin', 'support']), (req, res) => trackingController.getLocationHistory(req, res));
router.get('/playback/:deviceId', authenticateToken, requireRole(['parent', 'rider', 'admin', 'support']), (req, res) => trackingController.getRoutePlayback(req, res));
router.post('/log', authenticateToken, requireRole(['admin', 'support']), (req, res) => trackingController.logLocation(req, res));

export default router;
