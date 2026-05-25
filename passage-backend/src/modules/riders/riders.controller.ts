import { Request, Response } from 'express';
import { ridersService } from './riders.service';
import { BaseController } from '../base.controller';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { ValidationError, NotFoundError } from '../../utils/errors.util';

class RidersController extends BaseController {
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id);
      const rider = await ridersService.getRiderById(id);

      this.ensureResourceExists(rider, 'Rider');
      this.sendSuccess(res, 'Rider retrieved successfully', rider);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async getByParentId(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit } = this.parsePaginationParams(req.query);
      const parentUserId = this.getUserId(req as any);

      const result = await ridersService.getRidersByParentId(parentUserId, page, limit);
      
      const pagination = this.calculatePaginationMeta(result.total, page, limit);
      this.sendPaginatedSuccess(res, 'Riders retrieved successfully', result.data, pagination);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { user_id, parent_user_id, school, grade } = req.body;

      this.validateRequiredFields(
        req.body,
        ['user_id', 'parent_user_id', 'school', 'grade']
      );

      const rider = await ridersService.createRider({
        user_id,
        parent_user_id,
        school,
        grade,
      });

      this.sendSuccess(res, 'Rider created successfully', rider, 201);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id);
      const updates = req.body;

      const rider = await ridersService.updateRider(id, updates);

      this.ensureResourceExists(rider, 'Rider');
      this.sendSuccess(res, 'Rider updated successfully', rider);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id);
      const success = await ridersService.deleteRider(id);

      if (!success) {
        throw new NotFoundError('Rider');
      }

      this.sendSuccess(res, 'Rider deleted successfully', { id });
    } catch (error) {
      this.handleApiError(res, error);
    }
  }
}

export const ridersController = new RidersController();
