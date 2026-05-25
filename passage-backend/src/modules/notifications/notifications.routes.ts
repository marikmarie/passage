import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, (req, res) => notificationsController.getByUserId(req, res));
router.post('/', authenticateToken, (req, res) => notificationsController.send(req, res));

export default router;
