import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { sendError, sendSuccess } from '../../utils/response.util';
import { routePlanningService } from './route-planning.service';
import { CoordinatePoint } from './route-planning.types';

export class RoutePlanningController {
  async getDirections(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const start = this.readPointFromQuery(req.query, 'start');
      const end = this.readPointFromQuery(req.query, 'end');
      const profile = typeof req.query.profile === 'string' ? req.query.profile : undefined;

      const directions = await routePlanningService.getDirections({ start, end, profile });
      sendSuccess(res, 'Route directions retrieved successfully', directions);
    } catch (error: any) {
      sendError(res, error.message || 'Unable to retrieve route directions', error.statusCode || 500);
    }
  }

  async createDirections(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const directions = await routePlanningService.getDirections({
        start: req.body.start,
        end: req.body.end,
        profile: req.body.profile,
      });
      sendSuccess(res, 'Route directions retrieved successfully', directions);
    } catch (error: any) {
      sendError(res, error.message || 'Unable to retrieve route directions', error.statusCode || 500);
    }
  }

  async findNearestRider(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const nearestRider = routePlanningService.findNearestRider({
        pickup: req.body.pickup,
        vehicle_type: req.body.vehicle_type,
        candidates: Array.isArray(req.body.candidates) ? req.body.candidates : [],
      });

      if (!nearestRider) {
        sendError(res, 'No available rider matched the request', 404);
        return;
      }

      sendSuccess(res, 'Nearest rider matched successfully', nearestRider);
    } catch (error: any) {
      sendError(res, error.message || 'Unable to match nearest rider', error.statusCode || 500);
    }
  }

  private readPointFromQuery(query: AuthenticatedRequest['query'], prefix: 'start' | 'end'): CoordinatePoint {
    const lat = Number(query[`${prefix}_lat`]);
    const lng = Number(query[`${prefix}_lng`]);

    return { lat, lng };
  }
}

export const routePlanningController = new RoutePlanningController();
