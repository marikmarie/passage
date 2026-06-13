import { kidsModel, Kid, CreateKidDTO, UpdateKidDTO } from './kids.model';
import { getPaginationOptions, calculateOffset } from '../../utils/pagination.util';

export class KidsService {
  async getKidById(id: number): Promise<Kid | null> {
    return kidsModel.findById(id);
  }

  async getKidsByParentId(parentUserId: number, page?: string | number, limit?: string | number): Promise<any> {
    const { page: p, limit: l } = getPaginationOptions(page, limit);
    const offset = calculateOffset(p, l);

    const { kids, total } = await kidsModel.findByParentId(parentUserId, l, offset);

    return {
      data: kids,
      total,
    };
  }

  async getKidByDeviceId(deviceId: number): Promise<Kid | null> {
    return kidsModel.findByDeviceId(deviceId);
  }

  async getAllKids(page?: string | number, limit?: string | number): Promise<any> {
    const { page: p, limit: l } = getPaginationOptions(page, limit);
    const offset = calculateOffset(p, l);

    const { kids, total } = await kidsModel.findAll(l, offset);

    return {
      data: kids,
      total,
    };
  }

  async createKid(data: CreateKidDTO): Promise<Kid> {
    return kidsModel.create(data);
  }

  async updateKid(id: number, updates: UpdateKidDTO): Promise<Kid | null> {
    return kidsModel.update(id, updates);
  }

  async deleteKid(id: number): Promise<boolean> {
    return kidsModel.delete(id);
  }
}

export const kidsService = new KidsService();
