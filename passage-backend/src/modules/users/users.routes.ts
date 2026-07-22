import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const router = Router();

// User listing is admin/support only. App users should use /auth/me for their own profile.
router.get('/', authenticateToken, requireRole(['admin', 'support']), (req, res) => usersController.getAll(req, res));
router.get('/:id', authenticateToken, (req, res) => usersController.getById(req, res));
router.put('/:id', authenticateToken, (req, res) => usersController.update(req, res));
router.delete('/:id', authenticateToken, requireRole(['admin']), (req, res) => usersController.delete(req, res));

export default router;
