import { Router } from 'express';
import { tripsController } from './trips.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const router = Router();

router.post('/verify', authenticateToken, requireRole(['rider']), (req, res) => tripsController.verifyTrip(req, res));
router.post('/verify-watch', authenticateToken, requireRole(['rider']), (req, res) => tripsController.verifyWatch(req, res));
router.get('/active', authenticateToken, requireRole(['parent', 'rider', 'admin', 'support']), (req, res) => tripsController.getActiveTrip(req, res));
router.get('/rider/:riderId', authenticateToken, requireRole(['rider', 'admin', 'support']), (req, res) => tripsController.getByRiderId(req, res));
router.get('/:id', authenticateToken, requireRole(['parent', 'rider', 'admin', 'support']), (req, res) => tripsController.getById(req, res));
router.post('/', authenticateToken, requireRole(['rider', 'admin', 'support']), (req, res) => tripsController.create(req, res));
router.put('/:id/start', authenticateToken, requireRole(['rider']), (req, res) => tripsController.startTrip(req, res));
router.put('/:id/end', authenticateToken, requireRole(['rider', 'admin', 'support']), (req, res) => tripsController.endTrip(req, res));
router.put('/:id/cancel', authenticateToken, requireRole(['parent', 'rider', 'admin', 'support']), (req, res) => tripsController.cancelTrip(req, res));

export default router;
