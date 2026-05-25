import { Router } from 'express';
import { subscriptionsController } from './subscriptions.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, (req, res) => subscriptionsController.getByUserId(req, res));
router.get('/all', authenticateToken, (req, res) => subscriptionsController.getAll(req, res));
router.post('/', authenticateToken, (req, res) => subscriptionsController.create(req, res));
router.put('/:id/upgrade', authenticateToken, (req, res) => subscriptionsController.upgrade(req, res));
router.put('/:id/renew', authenticateToken, (req, res) => subscriptionsController.renew(req, res));

export default router;
