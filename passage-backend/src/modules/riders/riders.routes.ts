import { Router } from 'express';
import { ridersController } from './riders.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

// Riders routes
router.get('/me', authenticateToken, (req, res) => ridersController.getMe(req, res));
router.put('/me', authenticateToken, (req, res) => ridersController.upsertMe(req, res));
router.post('/me', authenticateToken, (req, res) => ridersController.upsertMe(req, res));
router.get('/by-parent', authenticateToken, (req, res) => ridersController.getByParentId(req, res));
router.get('/:id', authenticateToken, (req, res) => ridersController.getById(req, res));
router.post('/', authenticateToken, (req, res) => ridersController.create(req, res));
router.put('/:id', authenticateToken, (req, res) => ridersController.update(req, res));
router.delete('/:id', authenticateToken, (req, res) => ridersController.delete(req, res));

export default router;
