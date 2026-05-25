import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const router = Router();

// Users routes
router.get('/', authenticateToken, (req, res) => usersController.getAll(req, res));
router.get('/:id', authenticateToken, (req, res) => usersController.getById(req, res));
router.put('/:id', authenticateToken, (req, res) => usersController.update(req, res));
router.delete('/:id', authenticateToken, requireRole(['admin']), (req, res) => usersController.delete(req, res));

export default router;
