import { ridersModel, Rider, RiderProfileInput } from './riders.model';
import { getPaginationOptions, calculateOffset } from '../../utils/pagination.util';

export class RidersService {
  async getRiderById(id: number): Promise<Rider | null> {
    return ridersModel.findById(id);
  }

  async getRiderByUserId(userId: number): Promise<Rider | null> {
    return ridersModel.findByUserId(userId);
  }

  async getRidersByParentId(parentUserId: number, page?: string | number, limit?: string | number): Promise<any> {
    const { page: p, limit: l } = getPaginationOptions(page, limit);
    const offset = calculateOffset(p, l);

    const { riders, total } = await ridersModel.findByParentId(parentUserId, l, offset);

    return {
      riders,
      total,
      pagination: {
        total,
        page: p,
        limit: l,
        pages: Math.ceil(total / l),
      },
    };
  }

  async createRider(data: RiderProfileInput): Promise<Rider> {
    return ridersModel.create(data);
  }

  async upsertCurrentRiderProfile(userId: number, data: RiderProfileInput): Promise<Rider> {
    const isCompleteSubmission = Boolean(data.training_accepted && data.safeguarding_accepted);

    return ridersModel.upsertByUserId(userId, {
      ...data,
      approval_status: isCompleteSubmission ? 'pending_review' : data.approval_status ?? 'draft',
      submitted_at: isCompleteSubmission ? new Date() : data.submitted_at,
    });
  }

  async updateRider(id: number, updates: RiderProfileInput): Promise<Rider | null> {
    return ridersModel.update(id, updates);
  }

  async deleteRider(id: number): Promise<boolean> {
    return ridersModel.delete(id);
  }
}

export const ridersService = new RidersService();
