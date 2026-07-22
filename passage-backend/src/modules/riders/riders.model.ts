import { pool } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface Rider {
  id: number;
  user_id: number;
  parent_user_id?: number | null;
  school?: string | null;
  grade?: string | null;
  full_name?: string | null;
  date_of_birth?: string | null;
  nationality?: string | null;
  national_id_number?: string | null;
  national_id_front_url?: string | null;
  national_id_back_url?: string | null;
  profile_photo_url?: string | null;
  residential_area?: string | null;
  stage_association?: string | null;
  driving_licence_number?: string | null;
  driving_licence_image_url?: string | null;
  permit_number?: string | null;
  permit_image_url?: string | null;
  licence_expiry_date?: string | null;
  years_of_riding?: number | null;
  authorised_vehicle_class?: string | null;
  vehicle_type?: 'boda' | 'tuktuk' | null;
  number_plate?: string | null;
  vehicle_photo_url?: string | null;
  ownership_status?: string | null;
  insurance_info?: string | null;
  insurance_expiry_date?: string | null;
  verification_consent_accepted?: boolean;
  training_accepted?: boolean;
  safeguarding_accepted?: boolean;
  approval_status?: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'suspended';
  reviewed_by?: number | null;
  reviewed_at?: Date | null;
  review_note?: string | null;
  submitted_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export type RiderProfileInput = Partial<Omit<Rider, 'id' | 'created_at' | 'updated_at'>>;

const RIDER_PROFILE_COLUMNS = new Set([
  'user_id',
  'parent_user_id',
  'school',
  'grade',
  'full_name',
  'date_of_birth',
  'nationality',
  'national_id_number',
  'national_id_front_url',
  'national_id_back_url',
  'profile_photo_url',
  'residential_area',
  'stage_association',
  'driving_licence_number',
  'driving_licence_image_url',
  'permit_number',
  'permit_image_url',
  'licence_expiry_date',
  'years_of_riding',
  'authorised_vehicle_class',
  'vehicle_type',
  'number_plate',
  'vehicle_photo_url',
  'ownership_status',
  'insurance_info',
  'insurance_expiry_date',
  'verification_consent_accepted',
  'training_accepted',
  'safeguarding_accepted',
  'approval_status',
  'reviewed_by',
  'reviewed_at',
  'review_note',
  'submitted_at',
]);

export class RidersModel {
  async findById(id: number): Promise<Rider | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM riders WHERE id = ?',
      [id]
    );
    return rows.length ? (rows[0] as Rider) : null;
  }

  async findByUserId(userId: number): Promise<Rider | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM riders WHERE user_id = ?',
      [userId]
    );
    return rows.length ? (rows[0] as Rider) : null;
  }

  async findByParentId(parentUserId: number, limit: number = 10, offset: number = 0): Promise<{ riders: Rider[]; total: number }> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM riders WHERE parent_user_id = ? LIMIT ? OFFSET ?',
      [parentUserId, limit, offset]
    );

    const [countResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM riders WHERE parent_user_id = ?',
      [parentUserId]
    );

    return {
      riders: rows as Rider[],
      total: (countResult[0] as any).total,
    };
  }

  async create(data: RiderProfileInput): Promise<Rider> {
    const clean = this.filterAllowedColumns(data);
    if (!clean.user_id) {
      throw new Error('user_id is required to create rider profile');
    }

    const keys = Object.keys(clean);
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map((key) => (clean as any)[key]);

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO riders (${keys.join(', ')}) VALUES (${placeholders})`,
      values
    );

    const rider = await this.findById(result.insertId);
    if (!rider) throw new Error('Failed to create rider');
    return rider;
  }

  async upsertByUserId(userId: number, data: RiderProfileInput): Promise<Rider> {
    const existing = await this.findByUserId(userId);
    const clean = this.filterAllowedColumns({ ...data, user_id: userId });

    if (existing) {
      const { user_id, ...updates } = clean;
      const updated = await this.update(existing.id, updates);
      if (!updated) throw new Error('Failed to update rider profile');
      return updated;
    }

    return this.create(clean);
  }

  async update(id: number, updates: RiderProfileInput): Promise<Rider | null> {
    const clean = this.filterAllowedColumns(updates);
    delete (clean as any).user_id;

    const keys = Object.keys(clean);
    const values = keys.map((key) => (clean as any)[key]);

    if (keys.length === 0) return this.findById(id);

    const updateClause = keys.map(k => `${k} = ?`).join(', ');
    await pool.query(
      `UPDATE riders SET ${updateClause}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM riders WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  private filterAllowedColumns(data: RiderProfileInput): RiderProfileInput {
    return Object.entries(data).reduce<RiderProfileInput>((result, [key, value]) => {
      if (RIDER_PROFILE_COLUMNS.has(key) && value !== undefined) {
        (result as any)[key] = value;
      }
      return result;
    }, {});
  }
}

export const ridersModel = new RidersModel();
