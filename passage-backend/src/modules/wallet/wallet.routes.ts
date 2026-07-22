import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { walletController } from './wallet.controller';

const router = Router();

router.get('/', authenticateToken, (req, res) => walletController.getSummary(req, res));
router.post('/payouts', authenticateToken, requireRole(['rider']), (req, res) =>
  walletController.requestPayout(req, res)
);

export default router;
