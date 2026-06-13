import { pool } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface Kid {
  id: number;
  parent_user_id: number;
  device_id?: number | null;
  name: string;
  age?: number | null;
  school?: string | null;
  grade?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateKidDTO {
  parent_user_id: number;
  device_id?: number | null;
  name: string;
  age?: number;
  school?: string;
  grade?: string;
}

export interface UpdateKidDTO {
  parent_user_id?: number;
  device_id?: number | null;
  name?: string;
  age?: number;
  school?: string;
  grade?: string;
}

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
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO kids (parent_user_id, device_id, name, age, school, grade) VALUES (?, ?, ?, ?, ?, ?)',
      [data.parent_user_id, data.device_id || null, data.name, data.age || null, data.school || null, data.grade || null]
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
