import { Router } from 'express';
import { paymentsController } from './payments.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, (req, res) => paymentsController.getByUserId(req, res));
router.post('/', authenticateToken, (req, res) => paymentsController.initiatePayment(req, res));
router.get('/verify/:transactionId', authenticateToken, (req, res) => paymentsController.verifyPayment(req, res));

export default router;
