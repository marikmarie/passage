import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const router = Router();

router.get('/', authenticateToken, (req, res) => notificationsController.getByUserId(req, res));
router.put('/read-all', authenticateToken, (req, res) => notificationsController.markAllRead(req, res));
router.put('/:id/read', authenticateToken, (req, res) => notificationsController.markRead(req, res));
router.post('/', authenticateToken, requireRole(['admin', 'support']), (req, res) => notificationsController.send(req, res));

export default router;
