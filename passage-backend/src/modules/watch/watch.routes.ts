import { Router } from 'express';
import { authenticateDeviceToken } from '../../middleware/device-auth.middleware';
import { watchController } from './watch.controller';

const router = Router();

router.get('/state/:deviceId', authenticateDeviceToken, (req, res) => watchController.getState(req, res));
router.post('/verification-token', authenticateDeviceToken, (req, res) => watchController.requestVerificationToken(req, res));

export default router;
