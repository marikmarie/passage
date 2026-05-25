import { Request, Response } from 'express';
import { trackingService } from './tracking.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class TrackingController {
  async getLatestLocation(req: Request, res: Response): Promise<void> {
    try {
      const deviceId = Array.isArray(req.params.deviceId) ? req.params.deviceId[0] : (req.params.deviceId || '');
      const location = await trackingService.getLatestLocation(parseInt(deviceId));

      if (!location) {
        sendError(res, 'No location data available', 404);
        return;
      }

      sendSuccess(res, 'Latest location retrieved successfully', location);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async getLocationHistory(req: Request, res: Response): Promise<void> {
    try {
      const deviceId = Array.isArray(req.params.deviceId) ? req.params.deviceId[0] : (req.params.deviceId || '');
      const page = parseInt((req.query.page as string) || '1') || 1;
      const limit = parseInt((req.query.limit as string) || '10') || 10;

      const result = await trackingService.getLocationHistory(parseInt(deviceId), page, limit);
      sendSuccess(res, 'Location history retrieved successfully', result);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async logLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { device_id, lat, lng, accuracy, speed } = req.body;

      if (device_id === undefined || lat === undefined || lng === undefined || accuracy === undefined || speed === undefined) {
        sendError(res, 'Missing required fields', 400);
        return;
      }

      const log = await trackingService.logLocation({
        device_id,
        lat,
        lng,
        accuracy,
        speed,
      });

      sendSuccess(res, 'Location logged successfully', log, 201);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async getRoutePlayback(req: Request, res: Response): Promise<void> {
    try {
      // const { deviceId } = req.params;
      const deviceId = Array.isArray(req.params.deviceId) ? req.params.deviceId[0] : (req.params.deviceId || '');
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        sendError(res, 'startDate and endDate are required', 400);
        return;
      }

      const route = await trackingService.getRoutePlayback(
        parseInt(deviceId),
       new Date(String(startDate)),
        new Date(String(endDate))
      );

      sendSuccess(res, 'Route playback retrieved successfully', { route, count: route.length });
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}

export const trackingController = new TrackingController();
