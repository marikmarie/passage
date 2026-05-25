import { geofencesModel } from './geofences.model';
import { getPaginationOptions, calculateOffset } from '../../utils/pagination.util';

export class GeofencesService {
  async getGeofenceById(id: number) {
    return geofencesModel.findById(id);
  }

  async getGeofencesByParentId(parentUserId: number, page?: string | number, limit?: string | number) {
    const { page: p, limit: l } = getPaginationOptions(page, limit);
    const offset = calculateOffset(p, l);

    const { geofences, total } = await geofencesModel.findByParentId(parentUserId, l, offset);

    return {
      geofences,
      pagination: {
        total,
        page: p,
        limit: l,
        pages: Math.ceil(total / l),
      },
    };
  }

  async createGeofence(data: any) {
    return geofencesModel.create(data);
  }

  async updateGeofence(id: number, updates: any) {
    return geofencesModel.update(id, updates);
  }

  async deleteGeofence(id: number) {
    return geofencesModel.delete(id);
  }
}

export const geofencesService = new GeofencesService();
