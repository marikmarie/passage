import { trackingModel } from './tracking.model';
import { TrackingLog, CreateTrackingLogDTO } from '../../types/tracking.types';
import { getPaginationOptions, calculateOffset } from '../../utils/pagination.util';

export class TrackingService {
  async getLatestLocation(deviceId: number): Promise<TrackingLog | null> {
    return trackingModel.findLatestByDeviceId(deviceId);
  }

  async getLocationHistory(deviceId: number, page?: string | number, limit?: string | number): Promise<any> {
    const { page: p, limit: l } = getPaginationOptions(page, limit);
    const offset = calculateOffset(p, l);

    const { logs, total } = await trackingModel.findByDeviceId(deviceId, l, offset);

    return {
      logs,
      pagination: {
        total,
        page: p,
        limit: l,
        pages: Math.ceil(total / l),
      },
    };
  }

  async logLocation(data: CreateTrackingLogDTO): Promise<TrackingLog> {
    return trackingModel.create(data);
  }

  async getRoutePlayback(deviceId: number, startDate: Date, endDate: Date): Promise<TrackingLog[]> {
    return trackingModel.findLocationHistory(deviceId, startDate, endDate);
  }
}

export const trackingService = new TrackingService();
