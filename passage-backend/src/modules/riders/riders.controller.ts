import { Request, Response } from 'express';
import { ridersService } from './riders.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class RidersController {
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id || '');
      const rider = await ridersService.getRiderById(parseInt(id));

      if (!rider) {
        sendError(res, 'Rider not found', 404);
        return;
      }

      sendSuccess(res, 'Rider retrieved successfully', rider);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async getByParentId(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt((req.query.page as string) || '1') || 1;
      const limit = parseInt((req.query.limit as string) || '10') || 10;
      const parentUserId = (req as any).user?.id;

      if (!parentUserId) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const result = await ridersService.getRidersByParentId(parentUserId, page, limit);
      sendSuccess(res, 'Riders retrieved successfully', result);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { user_id, parent_user_id, school, grade } = req.body;

      if (!user_id || !parent_user_id || !school || !grade) {
        sendError(res, 'Missing required fields', 400);
        return;
      }

      const rider = await ridersService.createRider({
        user_id,
        parent_user_id,
        school,
        grade,
      });

      sendSuccess(res, 'Rider created successfully', rider, 201);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id || '');
      const updates = req.body;

      const rider = await ridersService.updateRider(parseInt(id), updates);

      if (!rider) {
        sendError(res, 'Rider not found', 404);
        return;
      }

      sendSuccess(res, 'Rider updated successfully', rider);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id || '');

      const success = await ridersService.deleteRider(parseInt(id));

      if (!success) {
        sendError(res, 'Rider not found', 404);
        return;
      }

      sendSuccess(res, 'Rider deleted successfully', { id: parseInt(id) });
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}

export const ridersController = new RidersController();
