import { Router } from 'express';
import { geofencesController } from './geofences.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.get('/:id', authenticateToken, (req, res) => geofencesController.getById(req, res));
router.get('/', authenticateToken, (req, res) => geofencesController.getByParentId(req, res));
router.post('/', authenticateToken, (req, res) => geofencesController.create(req, res));
router.put('/:id', authenticateToken, (req, res) => geofencesController.update(req, res));
router.delete('/:id', authenticateToken, (req, res) => geofencesController.delete(req, res));

export default router;
