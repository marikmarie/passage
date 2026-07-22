import { Request, Response } from "express";
import { devicesService } from "./devices.service";
import { BaseController } from "../base.controller";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { ForbiddenError, NotFoundError } from "../../utils/errors.util";

class DevicesController extends BaseController {
  private async assertCanAccessDevice(req: AuthenticatedRequest, deviceId: number): Promise<void> {
    if (!(await devicesService.canAccessDevice(req.user, deviceId))) {
      throw new ForbiddenError("You do not have permission to access this device.");
    }
  }

  async getWatchState(req: Request, res: Response): Promise<void> {
    try {
      const deviceId = this.parseId(req.params.deviceId, "device ID");
      const stateData = await devicesService.determineWatchState(deviceId);

      res.status(200).json({
        state: stateData.state,
        tripId: stateData.tripId,
        message: stateData.message,
        trackingIntervalSeconds: stateData.interval,
      });
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async sendLocation(req: Request, res: Response): Promise<void> {
    try {
      const {
        deviceId,
        tripId,
        lat,
        lng,
        accuracy,
        speed,
        bearing,
        battery,
        timestamp,
      } = req.body;
      await devicesService.saveLocation({
        deviceId,
        tripId,
        lat,
        lng,
        accuracy,
        speed,
        bearing,
        battery,
        timestamp,
      });
      res.status(200).json({ success: true });
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async sendEvent(req: Request, res: Response): Promise<void> {
    try {
      const { deviceId, tripId, eventType, battery, timestamp } = req.body;
      await devicesService.processEvent(deviceId, tripId, eventType, battery, timestamp);
      res.status(200).json({ success: true });
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async requestVerificationToken(req: Request, res: Response): Promise<void> {
    try {
      const { deviceId, tripId } = req.body;
      const tokenData = await devicesService.generateVerificationToken(deviceId, tripId);

      res.status(200).json({
        verificationToken: tokenData.token,
        expiresAt: tokenData.expiresAt,
      });
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit } = this.parsePaginationParams(req.query);
      const result = await devicesService.getAllDevices(page, limit);

      const pagination = this.calculatePaginationMeta(
        result.total,
        page,
        limit,
      );
      this.sendPaginatedSuccess(
        res,
        "Devices retrieved successfully",
        result.data,
        pagination,
      );
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id);
      await this.assertCanAccessDevice(req, id);

      const device = await devicesService.getDeviceById(id);
      this.ensureResourceExists(device, "Device");

      this.sendSuccess(res, "Device retrieved successfully", device);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { imei, sim_number, firmware_version } = req.body;

      this.validateRequiredFields(req.body, [
        "imei",
        "sim_number",
        "firmware_version",
      ]);

      const device = await devicesService.createDevice({
        imei,
        sim_number,
        firmware_version,
      });

      this.sendSuccess(res, "Device created successfully", device, 201);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id);
      const updates = req.body;

      const device = await devicesService.updateDevice(id, updates);

      this.ensureResourceExists(device, "Device");
      this.sendSuccess(res, "Device updated successfully", device);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id);
      const success = await devicesService.deleteDevice(id);

      if (!success) {
        throw new NotFoundError("Device");
      }

      this.sendSuccess(res, "Device deleted successfully", { id });
    } catch (error) {
      this.handleApiError(res, error);
    }
  }
}

export const devicesController = new DevicesController();
