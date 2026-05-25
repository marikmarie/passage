import { Router } from 'express';
import { devicesController } from './devices.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

// Devices routes
router.get('/', authenticateToken, (req, res) => devicesController.getAll(req, res));
router.get('/:id', authenticateToken, (req, res) => devicesController.getById(req, res));
router.get('/rider/:riderId', authenticateToken, (req, res) => devicesController.getByRiderId(req, res));
router.post('/', authenticateToken, (req, res) => devicesController.create(req, res));
router.put('/:id', authenticateToken, (req, res) => devicesController.update(req, res));
router.delete('/:id', authenticateToken, (req, res) => devicesController.delete(req, res));

export default router;
