import { pool } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface Kid {
  id: number;
  parent_user_id: number;
  device_id?: number | null;
  name: string;
  age?: number | null;
  date_of_birth?: string | null;
  gender?: string | null;
  school?: string | null;
  grade?: string | null;
  home_location?: string | null;
  home_lat?: number | null;
  home_lng?: number | null;
  school_location?: string | null;
  school_lat?: number | null;
  school_lng?: number | null;
  morning_pickup_time?: string | null;
  afternoon_return_time?: string | null;
  pickup_notes?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_relationship?: string | null;
  emergency_contact_phone?: string | null;
  guardian_name?: string | null;
  guardian_relationship?: string | null;
  guardian_phone?: string | null;
  allow_live_tracking?: boolean | number | null;
  safety_consent_at?: Date | string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateKidDTO {
  parent_user_id: number;
  device_id?: number | null;
  name: string;
  age?: number | null;
  date_of_birth?: string | null;
  gender?: string | null;
  school?: string | null;
  grade?: string | null;
  home_location?: string | null;
  home_lat?: number | null;
  home_lng?: number | null;
  school_location?: string | null;
  school_lat?: number | null;
  school_lng?: number | null;
  morning_pickup_time?: string | null;
  afternoon_return_time?: string | null;
  pickup_notes?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_relationship?: string | null;
  emergency_contact_phone?: string | null;
  guardian_name?: string | null;
  guardian_relationship?: string | null;
  guardian_phone?: string | null;
  allow_live_tracking?: boolean | null;
  safety_consent_at?: Date | string | null;
}

export interface UpdateKidDTO {
  parent_user_id?: number;
  device_id?: number | null;
  name?: string;
  age?: number | null;
  date_of_birth?: string | null;
  gender?: string | null;
  school?: string | null;
  grade?: string | null;
  home_location?: string | null;
  home_lat?: number | null;
  home_lng?: number | null;
  school_location?: string | null;
  school_lat?: number | null;
  school_lng?: number | null;
  morning_pickup_time?: string | null;
  afternoon_return_time?: string | null;
  pickup_notes?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_relationship?: string | null;
  emergency_contact_phone?: string | null;
  guardian_name?: string | null;
  guardian_relationship?: string | null;
  guardian_phone?: string | null;
  allow_live_tracking?: boolean | null;
  safety_consent_at?: Date | string | null;
}

const CREATE_KID_COLUMNS = [
  'parent_user_id',
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
] as const;

export class KidsModel {
  async findById(id: number): Promise<Kid | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM kids WHERE id = ?',
      [id]
    );
    return rows.length ? (rows[0] as Kid) : null;
  }

  async findByParentId(parentUserId: number, limit: number = 10, offset: number = 0): Promise<{ kids: Kid[]; total: number }> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM kids WHERE parent_user_id = ? LIMIT ? OFFSET ?',
      [parentUserId, limit, offset]
    );

    const [countResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM kids WHERE parent_user_id = ?',
      [parentUserId]
    );

    return {
      kids: rows as Kid[],
      total: (countResult[0] as any).total,
    };
  }

  async findByDeviceId(deviceId: number): Promise<Kid | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM kids WHERE device_id = ?',
      [deviceId]
    );
    return rows.length ? (rows[0] as Kid) : null;
  }

  async findAll(limit: number = 10, offset: number = 0): Promise<{ kids: Kid[]; total: number }> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM kids LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const [countResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM kids'
    );

    return {
      kids: rows as Kid[],
      total: (countResult[0] as any).total,
    };
  }

  async create(data: CreateKidDTO): Promise<Kid> {
    const placeholders = CREATE_KID_COLUMNS.map(() => '?').join(', ');
    const values = CREATE_KID_COLUMNS.map((column) => (data as any)[column] ?? null);

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO kids (${CREATE_KID_COLUMNS.join(', ')}) VALUES (${placeholders})`,
      values
    );

    const kid = await this.findById(result.insertId);
    if (!kid) throw new Error('Failed to create kid');
    return kid;
  }

  async update(id: number, updates: UpdateKidDTO): Promise<Kid | null> {
    const keys = Object.keys(updates);
    const values = Object.values(updates);

    if (keys.length === 0) return this.findById(id);

    const updateClause = keys.map(k => `${k} = ?`).join(', ');
    await pool.query(
      `UPDATE kids SET ${updateClause}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM kids WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

export const kidsModel = new KidsModel();