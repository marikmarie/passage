import { kidsModel, Kid, CreateKidDTO, UpdateKidDTO } from './kids.model';
import { getPaginationOptions, calculateOffset } from '../../utils/pagination.util';

const USER_EDITABLE_KID_FIELDS = [
  'device_id',
  'name',
  'age',
  'date_of_birth',
  'gender',
  'school',
  'grade',
  'home_location',
  'home_lat',
  'home_lng',
  'school_location',
  'school_lat',
  'school_lng',
  'morning_pickup_time',
  'afternoon_return_time',
  'pickup_notes',
  'emergency_contact_name',
  'emergency_contact_relationship',
  'emergency_contact_phone',
  'guardian_name',
  'guardian_relationship',
  'guardian_phone',
  'allow_live_tracking',
  'safety_consent_at',
];
const PRIVILEGED_KID_FIELDS = [...USER_EDITABLE_KID_FIELDS, 'parent_user_id'];

export class KidsService {
  private filterKidUpdates(updates: UpdateKidDTO, allowPrivilegedFields: boolean): UpdateKidDTO {
    const allowedFields = allowPrivilegedFields ? PRIVILEGED_KID_FIELDS : USER_EDITABLE_KID_FIELDS;

    return Object.fromEntries(
      Object.entries(updates).filter(([key]) => allowedFields.includes(key))
    ) as UpdateKidDTO;
  }

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

  async updateKid(id: number, updates: UpdateKidDTO, allowPrivilegedFields: boolean = false): Promise<Kid | null> {
    return kidsModel.update(id, this.filterKidUpdates(updates, allowPrivilegedFields));
  }

  async deleteKid(id: number): Promise<boolean> {
    return kidsModel.delete(id);
  }
}

export const kidsService = new KidsService();