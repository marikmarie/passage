import { Router } from 'express';
import { tripsController } from './trips.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.get('/:id', authenticateToken, (req, res) => tripsController.getById(req, res));
router.get('/rider/:riderId', authenticateToken, (req, res) => tripsController.getByRiderId(req, res));
router.post('/', authenticateToken, (req, res) => tripsController.create(req, res));
router.put('/:id/end', authenticateToken, (req, res) => tripsController.endTrip(req, res));
router.put('/:id/cancel', authenticateToken, (req, res) => tripsController.cancelTrip(req, res));

export default router;
