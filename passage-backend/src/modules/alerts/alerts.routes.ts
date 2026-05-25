import { Router } from 'express';
import { alertsController } from './alerts.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, (req, res) => alertsController.getAll(req, res));
router.get('/device/:deviceId', authenticateToken, (req, res) => alertsController.getByDeviceId(req, res));
router.post('/', authenticateToken, (req, res) => alertsController.create(req, res));
router.put('/:id/resolve', authenticateToken, (req, res) => alertsController.resolve(req, res));

export default router;
