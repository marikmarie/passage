import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

// Auth routes
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/otp/request', (req, res) => authController.requestOtp(req, res));
router.post('/otp/verify', (req, res) => authController.verifyOtp(req, res));
router.get('/me', authenticateToken, (req, res) => authController.me(req, res));

export default router;

