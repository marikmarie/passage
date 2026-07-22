import { Request, Response } from 'express';
import { BaseController } from '../base.controller';
import { kidsService } from './kids.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { ForbiddenError, NotFoundError } from '../../utils/errors.util';

const PRIVILEGED_ROLES = ['admin', 'support'];

class KidsController extends BaseController {
  private isPrivileged(req: AuthenticatedRequest): boolean {
    return Boolean(req.user && PRIVILEGED_ROLES.includes(req.user.role));
  }

  private canAccessKid(req: AuthenticatedRequest, parentUserId: number): boolean {
    return this.isPrivileged(req) || req.user?.id === parentUserId;
  }

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

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id);
      const kid = await kidsService.getKidById(id);
      const validatedKid = this.ensureResourceExists(kid, 'Kid');

      if (!this.canAccessKid(req, validatedKid.parent_user_id)) {
        throw new ForbiddenError('You can only access children registered under your account.');
      }

      this.sendSuccess(res, 'Kid retrieved successfully', validatedKid);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async getByParentId(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { page, limit } = this.parsePaginationParams(req.query);
      const parentUserId = this.isPrivileged(req) && req.query.parent_user_id
        ? this.parseId(req.query.parent_user_id, 'Parent user ID')
        : this.getUserId(req);

      const result = await kidsService.getKidsByParentId(parentUserId, page, limit);
      const pagination = this.calculatePaginationMeta(result.total, page, limit);
      this.sendPaginatedSuccess(res, 'Kids retrieved successfully', result.data, pagination);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async getByDeviceId(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const deviceId = this.parseId(req.params.deviceId, 'Device ID');
      const kid = await kidsService.getKidByDeviceId(deviceId);
      const validatedKid = this.ensureResourceExists(kid, 'Kid');

      if (!this.canAccessKid(req, validatedKid.parent_user_id)) {
        throw new ForbiddenError('You can only access children registered under your account.');
      }

      this.sendSuccess(res, 'Kid retrieved successfully', validatedKid);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        device_id,
        name,
        age,
        date_of_birth,
        gender,
        school,
        grade,
        home_location,
        home_lat,
        home_lng,
        school_location,
        school_lat,
        school_lng,
        morning_pickup_time,
        afternoon_return_time,
        pickup_notes,
        emergency_contact_name,
        emergency_contact_relationship,
        emergency_contact_phone,
        guardian_name,
        guardian_relationship,
        guardian_phone,
        allow_live_tracking,
        safety_consent_at,
      } = req.body;
      const parentUserId = this.isPrivileged(req) && req.body.parent_user_id
        ? this.parseId(req.body.parent_user_id, 'Parent user ID')
        : this.getUserId(req);

      this.validateRequiredFields(req.body, ['name']);

      const kid = await kidsService.createKid({
        parent_user_id: parentUserId,
        device_id: device_id || null,
        name,
        age,
        date_of_birth,
        gender,
        school,
        grade,
        home_location,
        home_lat,
        home_lng,
        school_location,
        school_lat,
        school_lng,
        morning_pickup_time,
        afternoon_return_time,
        pickup_notes,
        emergency_contact_name,
        emergency_contact_relationship,
        emergency_contact_phone,
        guardian_name,
        guardian_relationship,
        guardian_phone,
        allow_live_tracking,
        safety_consent_at,
      });

      this.sendSuccess(res, 'Kid created successfully', kid, 201);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id);
      const existingKid = await kidsService.getKidById(id);
      const validatedKid = this.ensureResourceExists(existingKid, 'Kid');

      if (!this.canAccessKid(req, validatedKid.parent_user_id)) {
        throw new ForbiddenError('You can only update children registered under your account.');
      }

      const kid = await kidsService.updateKid(id, req.body, this.isPrivileged(req));
      this.ensureResourceExists(kid, 'Kid');

      this.sendSuccess(res, 'Kid updated successfully', kid);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id);
      const existingKid = await kidsService.getKidById(id);
      const validatedKid = this.ensureResourceExists(existingKid, 'Kid');

      if (!this.canAccessKid(req, validatedKid.parent_user_id)) {
        throw new ForbiddenError('You can only delete children registered under your account.');
      }

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
