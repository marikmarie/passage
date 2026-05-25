import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

// Auth routes
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.get('/me', authenticateToken, (req, res) => authController.me(req, res));

export default router;

