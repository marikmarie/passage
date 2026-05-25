import { Router } from 'express';
import { trackingController } from './tracking.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

// Tracking routes
router.get('/latest/:deviceId', authenticateToken, (req, res) => trackingController.getLatestLocation(req, res));
router.get('/history/:deviceId', authenticateToken, (req, res) => trackingController.getLocationHistory(req, res));
router.get('/playback/:deviceId', authenticateToken, (req, res) => trackingController.getRoutePlayback(req, res));
router.post('/log', authenticateToken, (req, res) => trackingController.logLocation(req, res));

export default router;
