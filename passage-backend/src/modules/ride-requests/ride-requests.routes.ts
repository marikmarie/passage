import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { rideRequestsController } from './ride-requests.controller';

const router = Router();

router.get('/active', authenticateToken, requireRole(['parent', 'rider']), (req, res) => rideRequestsController.getActive(req, res));
router.get('/', authenticateToken, requireRole(['parent', 'rider']), (req, res) => rideRequestsController.list(req, res));
router.post('/', authenticateToken, requireRole(['parent']), (req, res) => rideRequestsController.create(req, res));
router.put('/rider/availability', authenticateToken, requireRole(['rider']), (req, res) => rideRequestsController.updateAvailability(req, res));
router.post('/:id/accept', authenticateToken, requireRole(['rider']), (req, res) => rideRequestsController.accept(req, res));
router.post('/:id/decline', authenticateToken, requireRole(['rider']), (req, res) => rideRequestsController.decline(req, res));
router.post('/:id/cancel', authenticateToken, requireRole(['parent']), (req, res) => rideRequestsController.cancel(req, res));
router.get('/:id', authenticateToken, requireRole(['parent', 'rider', 'admin', 'support']), (req, res) => rideRequestsController.getById(req, res));

export default router;