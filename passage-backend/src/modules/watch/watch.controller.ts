import { Response } from 'express';
import { BaseController } from '../base.controller';
import { devicesService } from '../devices/devices.service';
import { DeviceAuthenticatedRequest } from '../../middleware/device-auth.middleware';
import { ValidationError } from '../../utils/errors.util';

class WatchController extends BaseController {
  async getState(req: DeviceAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const deviceId = req.device?.id;

      if (!deviceId) {
        throw new ValidationError('Authenticated device was not found on the request');
      }

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

  async requestVerificationToken(req: DeviceAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const deviceId = req.device?.id;
      const tripId = Number(req.body.tripId);

      if (!deviceId) {
        throw new ValidationError('Authenticated device was not found on the request');
      }

      if (!Number.isInteger(tripId) || tripId <= 0) {
        throw new ValidationError('tripId is required');
      }

      const tokenData = await devicesService.generateVerificationToken(deviceId, tripId);

      res.status(200).json({
        verificationToken: tokenData.token,
        expiresAt: tokenData.expiresAt,
      });
    } catch (error) {
      this.handleApiError(res, error);
    }
  }
}

export const watchController = new WatchController();
