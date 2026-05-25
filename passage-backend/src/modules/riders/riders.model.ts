import { pool } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface Rider {
  id: number;
  user_id: number;
  parent_user_id: number;
  school: string;
  grade: string;
  created_at: Date;
  updated_at: Date;
}

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

  async create(data: any): Promise<Rider> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO riders (user_id, parent_user_id, school, grade) VALUES (?, ?, ?, ?)',
      [data.user_id, data.parent_user_id, data.school, data.grade]
    );

    const rider = await this.findById(result.insertId);
    if (!rider) throw new Error('Failed to create rider');
    return rider;
  }

  async update(id: number, updates: any): Promise<Rider | null> {
    const keys = Object.keys(updates);
    const values = Object.values(updates);

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
}

export const ridersModel = new RidersModel();
