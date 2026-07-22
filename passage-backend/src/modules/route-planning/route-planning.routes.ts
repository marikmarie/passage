import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { routePlanningController } from './route-planning.controller';

const router = Router();
const routeUserRoles = ['parent', 'rider', 'admin', 'support'];

router.get('/directions', authenticateToken, requireRole(routeUserRoles), (req, res) => routePlanningController.getDirections(req, res));
router.post('/directions', authenticateToken, requireRole(routeUserRoles), (req, res) => routePlanningController.createDirections(req, res));
router.post('/nearest-rider', authenticateToken, requireRole(['parent', 'admin', 'support']), (req, res) => routePlanningController.findNearestRider(req, res));

export default router;
