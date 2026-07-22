import { Router } from 'express';
import { devicesController } from './devices.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { tripsController } from '../trips/trips.controller';
import { authenticateDeviceToken } from '../../middleware/device-auth.middleware';

const router = Router();

// Watch/device-ingest compatibility endpoints require device bearer tokens.
router.get('/state/:deviceId', authenticateDeviceToken, (req, res) => devicesController.getWatchState(req, res));
router.post('/location', authenticateDeviceToken, (req, res) => devicesController.sendLocation(req, res));
router.post('/event', authenticateDeviceToken, (req, res) => devicesController.sendEvent(req, res));
router.post('/verification-token', authenticateDeviceToken, (req, res) => devicesController.requestVerificationToken(req, res));
router.post('/verify-watch', authenticateToken, requireRole(['rider']), (req, res) => tripsController.verifyWatch(req, res));

router.get('/', authenticateToken, requireRole(['admin', 'support']), (req, res) => devicesController.getAll(req, res));
router.get('/:id', authenticateToken, requireRole(['parent', 'rider', 'admin', 'support']), (req, res) => devicesController.getById(req, res));
router.post('/', authenticateToken, requireRole(['admin', 'support']), (req, res) => devicesController.create(req, res));
router.put('/:id', authenticateToken, requireRole(['admin', 'support']), (req, res) => devicesController.update(req, res));
router.delete('/:id', authenticateToken, requireRole(['admin']), (req, res) => devicesController.delete(req, res));

export default router;
