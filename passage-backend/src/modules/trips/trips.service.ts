import { tripsModel } from './trips.model';

export class TripsService {
  async getTripById(id: number) {
    return tripsModel.findById(id);
  }

  async getTripsByRiderId(riderId: number, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    return tripsModel.findByRiderId(riderId, limit, offset);
  }

  async createTrip(data: any) {
    return tripsModel.create(data);
  }

  async endTrip(id: number, distance_km: number) {
    return tripsModel.update(id, {
      end_time: new Date(),
      distance_km,
      status: 'completed',
    });
  }

  async cancelTrip(id: number) {
    return tripsModel.update(id, {
      status: 'cancelled',
    });
  }
}

export const tripsService = new TripsService();
