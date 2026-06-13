import { Request, Response } from 'express';
import { BaseController } from '../base.controller';
import { kidsService } from './kids.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { NotFoundError } from '../../utils/errors.util';

class KidsController extends BaseController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit } = this.parsePaginationParams(req.query);
      const result = await kidsService.getAllKids(page, limit);

      const pagination = this.calculatePaginationMeta(result.total, page, limit);
      this.sendPaginatedSuccess(res, 'Kids retrieved successfully', result.data, pagination);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id);
      const kid = await kidsService.getKidById(id);

      this.ensureResourceExists(kid, 'Kid');
      this.sendSuccess(res, 'Kid retrieved successfully', kid);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async getByParentId(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { page, limit } = this.parsePaginationParams(req.query);
      const parentUserId = this.getUserId(req);

      const result = await kidsService.getKidsByParentId(parentUserId, page, limit);
      const pagination = this.calculatePaginationMeta(result.total, page, limit);
      this.sendPaginatedSuccess(res, 'Kids retrieved successfully', result.data, pagination);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async getByDeviceId(req: Request, res: Response): Promise<void> {
    try {
      const deviceId = this.parseId(req.params.deviceId, 'Device ID');
      const kid = await kidsService.getKidByDeviceId(deviceId);

      this.ensureResourceExists(kid, 'Kid');
      this.sendSuccess(res, 'Kid retrieved successfully', kid);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { parent_user_id, device_id, name, age, school, grade } = req.body;

      this.validateRequiredFields(req.body, ['parent_user_id', 'name']);

      const kid = await kidsService.createKid({
        parent_user_id,
        device_id: device_id || null,
        name,
        age,
        school,
        grade,
      });

      this.sendSuccess(res, 'Kid created successfully', kid, 201);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id);
      const updates = req.body;

      const kid = await kidsService.updateKid(id, updates);
      this.ensureResourceExists(kid, 'Kid');

      this.sendSuccess(res, 'Kid updated successfully', kid);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id);
      const success = await kidsService.deleteKid(id);

      if (!success) {
        throw new NotFoundError('Kid');
      }

      this.sendSuccess(res, 'Kid deleted successfully', { id });
    } catch (error) {
      this.handleApiError(res, error);
    }
  }
}

export const kidsController = new KidsController();
