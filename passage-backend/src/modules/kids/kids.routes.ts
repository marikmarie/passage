import { Router } from 'express';
import { kidsController } from './kids.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, (req, res) => kidsController.getAll(req, res));
router.get('/by-parent', authenticateToken, (req, res) => kidsController.getByParentId(req, res));
router.get('/device/:deviceId', authenticateToken, (req, res) => kidsController.getByDeviceId(req, res));
router.get('/:id', authenticateToken, (req, res) => kidsController.getById(req, res));
router.post('/', authenticateToken, (req, res) => kidsController.create(req, res));
router.put('/:id', authenticateToken, (req, res) => kidsController.update(req, res));
router.delete('/:id', authenticateToken, (req, res) => kidsController.delete(req, res));

export default router;
