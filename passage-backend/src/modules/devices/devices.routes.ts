import { Router } from 'express';
import { devicesController } from './devices.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { tripsController } from '../trips/trips.controller';

const router = Router();

// Devices routes
router.get('/state/:deviceId', (req, res) => devicesController.getWatchState(req, res));
router.post('/location', (req, res) => devicesController.sendLocation(req, res));
router.post('/event', (req, res) => devicesController.sendEvent(req, res));
router.post('/verification-token', (req, res) => devicesController.requestVerificationToken(req, res));
router.post('/verify-watch', authenticateToken, (req, res) => tripsController.verifyTrip(req, res));

router.get('/', authenticateToken, (req, res) => devicesController.getAll(req, res));
router.get('/:id', authenticateToken, (req, res) => devicesController.getById(req, res));
router.post('/', authenticateToken, (req, res) => devicesController.create(req, res));
router.put('/:id', authenticateToken, (req, res) => devicesController.update(req, res));
router.delete('/:id', authenticateToken, (req, res) => devicesController.delete(req, res));

export default router;
