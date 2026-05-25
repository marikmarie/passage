import { Request, Response } from 'express';
import { alertsService } from './alerts.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class AlertsController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt((req.query.page as string) || '1') || 1;
      const limit = parseInt((req.query.limit as string) || '10') || 10;
      const result = await alertsService.getAllAlerts(page, limit);
      sendSuccess(res, 'Alerts retrieved successfully', result);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async getByDeviceId(req: Request, res: Response): Promise<void> {
    try {
      const deviceId = Array.isArray(req.params.deviceId) ? req.params.deviceId[0] : (req.params.deviceId || '');
      const page = parseInt((req.query.page as string) || '1') || 1;
      const limit = parseInt((req.query.limit as string) || '10') || 10;

      const result = await alertsService.getAlertsByDeviceId(parseInt(deviceId), page, limit);
      sendSuccess(res, 'Alerts retrieved successfully', result);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { device_id, rider_id, type } = req.body;

      if (!device_id || !rider_id || !type) {
        sendError(res, 'Missing required fields', 400);
        return;
      }

      const alert = await alertsService.createAlert({ device_id, rider_id, type });
      sendSuccess(res, 'Alert created successfully', alert, 201);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async resolve(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id || '');

      const alert = await alertsService.resolveAlert(parseInt(id));

      if (!alert) {
        sendError(res, 'Alert not found', 404);
        return;
      }

      sendSuccess(res, 'Alert resolved successfully', alert);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}

export const alertsController = new AlertsController();
