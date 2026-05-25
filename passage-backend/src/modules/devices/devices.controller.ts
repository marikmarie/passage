import { Request, Response } from 'express';
import { devicesService } from './devices.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class DevicesController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await devicesService.getAllDevices(page, limit);

      sendSuccess(res, 'Devices retrieved successfully', result);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      const device = await devicesService.getDeviceById(id);

      if (!device) {
        sendError(res, 'Device not found', 404);
        return;
      }

      sendSuccess(res, 'Device retrieved successfully', device);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async getByRiderId(req: Request, res: Response): Promise<void> {
    try {
      const riderId = Number(req.params.riderId);

      const device = await devicesService.getDeviceByRiderId(riderId);

      if (!device) {
        sendError(res, 'Device not found for rider', 404);
        return;
      }

      sendSuccess(res, 'Device retrieved successfully', device);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { rider_id, imei, sim_number, firmware_version } = req.body;

      if (!rider_id || !imei || !sim_number || !firmware_version) {
        sendError(res, 'Missing required fields', 400);
        return;
      }

      const device = await devicesService.createDevice({
        rider_id,
        imei,
        sim_number,
        firmware_version,
      });

      sendSuccess(res, 'Device created successfully', device, 201);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const updates = req.body;

      const device = await devicesService.updateDevice(id, updates);

      if (!device) {
        sendError(res, 'Device not found', 404);
        return;
      }

      sendSuccess(res, 'Device updated successfully', device);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      const success = await devicesService.deleteDevice(id);

      if (!success) {
        sendError(res, 'Device not found', 404);
        return;
      }

      sendSuccess(res, 'Device deleted successfully', { id });
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}

export const devicesController = new DevicesController();