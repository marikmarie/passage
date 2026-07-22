import { Router } from 'express';
import { kidsController } from './kids.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const router = Router();

// Child records contain sensitive identity data. Parents can access their own children;
// support/admin can access wider records for operations and assistance.
router.get('/', authenticateToken, requireRole(['admin', 'support']), (req, res) => kidsController.getAll(req, res));
router.get('/by-parent', authenticateToken, (req, res) => kidsController.getByParentId(req, res));
router.get('/device/:deviceId', authenticateToken, (req, res) => kidsController.getByDeviceId(req, res));
router.get('/:id', authenticateToken, (req, res) => kidsController.getById(req, res));
router.post('/', authenticateToken, requireRole(['parent', 'admin', 'support']), (req, res) => kidsController.create(req, res));
router.put('/:id', authenticateToken, requireRole(['parent', 'admin', 'support']), (req, res) => kidsController.update(req, res));
router.delete('/:id', authenticateToken, requireRole(['parent', 'admin']), (req, res) => kidsController.delete(req, res));

export default router;
