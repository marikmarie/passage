import { Request, Response } from 'express';
import { geofencesService } from './geofences.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class GeofencesController {
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      const geofence = await geofencesService.getGeofenceById(id);

      if (!geofence) {
        sendError(res, 'Geofence not found', 404);
        return;
      }

      sendSuccess(res, 'Geofence retrieved successfully', geofence);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async getByParentId(req: Request, res: Response): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const parentUserId = (req as any).user?.id;

      if (!parentUserId) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const result = await geofencesService.getGeofencesByParentId(
        parentUserId,
        page,
        limit
      );

      sendSuccess(res, 'Geofences retrieved successfully', result);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { parent_user_id, name, lat, lng, radius_m } = req.body;

      if (
        !parent_user_id ||
        !name ||
        lat === undefined ||
        lng === undefined ||
        !radius_m
      ) {
        sendError(res, 'Missing required fields', 400);
        return;
      }

      const geofence = await geofencesService.createGeofence({
        parent_user_id,
        name,
        lat,
        lng,
        radius_m,
      });

      sendSuccess(res, 'Geofence created successfully', geofence, 201);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const updates = req.body;

      const geofence = await geofencesService.updateGeofence(id, updates);

      if (!geofence) {
        sendError(res, 'Geofence not found', 404);
        return;
      }

      sendSuccess(res, 'Geofence updated successfully', geofence);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      const success = await geofencesService.deleteGeofence(id);

      if (!success) {
        sendError(res, 'Geofence not found', 404);
        return;
      }

      sendSuccess(res, 'Geofence deleted successfully', { id });
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}

export const geofencesController = new GeofencesController();