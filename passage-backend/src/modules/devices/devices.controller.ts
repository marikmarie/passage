import { Request, Response } from 'express';
import { devicesService } from './devices.service';
import { BaseController } from '../base.controller';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { ValidationError, NotFoundError } from '../../utils/errors.util';

class DevicesController extends BaseController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit } = this.parsePaginationParams(req.query);
      const result = await devicesService.getAllDevices(page, limit);

      const pagination = this.calculatePaginationMeta(result.total, page, limit);
      this.sendPaginatedSuccess(res, 'Devices retrieved successfully', result.data, pagination);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id);
      const device = await devicesService.getDeviceById(id);

      this.ensureResourceExists(device, 'Device');
      this.sendSuccess(res, 'Device retrieved successfully', device);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async getByRiderId(req: Request, res: Response): Promise<void> {
    try {
      const riderId = this.parseId(req.params.riderId);
      const device = await devicesService.getDeviceByRiderId(riderId);

      this.ensureResourceExists(device, 'Device');
      this.sendSuccess(res, 'Device retrieved successfully', device);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { rider_id, imei, sim_number, firmware_version } = req.body;

      this.validateRequiredFields(
        req.body,
        ['rider_id', 'imei', 'sim_number', 'firmware_version']
      );

      const device = await devicesService.createDevice({
        rider_id,
        imei,
        sim_number,
        firmware_version,
      });

      this.sendSuccess(res, 'Device created successfully', device, 201);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id);
      const updates = req.body;

      const device = await devicesService.updateDevice(id, updates);

      this.ensureResourceExists(device, 'Device');
      this.sendSuccess(res, 'Device updated successfully', device);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id);
      const success = await devicesService.deleteDevice(id);

      if (!success) {
        throw new NotFoundError('Device');
      }

      this.sendSuccess(res, 'Device deleted successfully', { id });
    } catch (error) {
      this.handleApiError(res, error);
    }
  }
}

export const devicesController = new DevicesController();