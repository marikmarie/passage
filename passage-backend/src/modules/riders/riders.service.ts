import { ridersModel, Rider } from './riders.model';
import { getPaginationOptions, calculateOffset } from '../../utils/pagination.util';

export class RidersService {
  async getRiderById(id: number): Promise<Rider | null> {
    return ridersModel.findById(id);
  }

  async getRidersByParentId(parentUserId: number, page?: string | number, limit?: string | number): Promise<any> {
    const { page: p, limit: l } = getPaginationOptions(page, limit);
    const offset = calculateOffset(p, l);

    const { riders, total } = await ridersModel.findByParentId(parentUserId, l, offset);

    return {
      riders,
      pagination: {
        total,
        page: p,
        limit: l,
        pages: Math.ceil(total / l),
      },
    };
  }

  async createRider(data: any): Promise<Rider> {
    return ridersModel.create(data);
  }

  async updateRider(id: number, updates: any): Promise<Rider | null> {
    return ridersModel.update(id, updates);
  }

  async deleteRider(id: number): Promise<boolean> {
    return ridersModel.delete(id);
  }
}

export const ridersService = new RidersService();
