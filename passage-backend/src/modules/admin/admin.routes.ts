import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const router = Router();

// Admin routes - all require authentication and admin role
router.use(authenticateToken, requireRole(['admin']));

router.get('/stats', (req, res) => adminController.getSystemStats(req, res));
router.get('/users', (req, res) => adminController.getAllUsers(req, res));
router.put('/users/:userId/status', (req, res) => adminController.updateUserStatus(req, res));
router.get('/devices', (req, res) => adminController.getAllDevices(req, res));
router.get('/alerts', (req, res) => adminController.getAllAlerts(req, res));
router.get('/payments', (req, res) => adminController.getAllPayments(req, res));

export default router;
