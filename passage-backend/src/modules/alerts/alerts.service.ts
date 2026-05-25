import { alertsModel } from './alerts.model';
import { getPaginationOptions, calculateOffset } from '../../utils/pagination.util';

export class AlertsService {
  async getAlertById(id: number) {
    return alertsModel.findById(id);
  }

  async getAllAlerts(page?: string | number, limit?: string | number) {
    const { page: p, limit: l } = getPaginationOptions(page, limit);
    const offset = calculateOffset(p, l);

    const { alerts, total } = await alertsModel.findAll(l, offset);

    return {
      alerts,
      pagination: {
        total,
        page: p,
        limit: l,
        pages: Math.ceil(total / l),
      },
    };
  }

  async getAlertsByDeviceId(deviceId: number, page?: string | number, limit?: string | number) {
    const { page: p, limit: l } = getPaginationOptions(page, limit);
    const offset = calculateOffset(p, l);

    const { alerts, total } = await alertsModel.findByDeviceId(deviceId, l, offset);

    return {
      alerts,
      pagination: {
        total,
        page: p,
        limit: l,
        pages: Math.ceil(total / l),
      },
    };
  }

  async createAlert(data: any) {
    return alertsModel.create(data);
  }

  async resolveAlert(id: number) {
    return alertsModel.resolve(id);
  }
}

export const alertsService = new AlertsService();
