import { pool } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface Geofence {
  id: number;
  parent_user_id: number;
  name: string;
  lat: number;
  lng: number;
  radius_m: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class GeofencesModel {
  async findById(id: number): Promise<Geofence | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM geofences WHERE id = ?',
      [id]
    );
    return rows.length ? (rows[0] as Geofence) : null;
  }

  async findByParentId(parentUserId: number, limit: number = 10, offset: number = 0): Promise<{ geofences: Geofence[]; total: number }> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM geofences WHERE parent_user_id = ? LIMIT ? OFFSET ?',
      [parentUserId, limit, offset]
    );

    const [countResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM geofences WHERE parent_user_id = ?',
      [parentUserId]
    );

    return {
      geofences: rows as Geofence[],
      total: (countResult[0] as any).total,
    };
  }

  async create(data: any): Promise<Geofence> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO geofences (parent_user_id, name, lat, lng, radius_m, active) VALUES (?, ?, ?, ?, ?, ?)',
      [data.parent_user_id, data.name, data.lat, data.lng, data.radius_m, true]
    );

    const geofence = await this.findById(result.insertId);
    if (!geofence) throw new Error('Failed to create geofence');
    return geofence;
  }

  async update(id: number, updates: any): Promise<Geofence | null> {
    const keys = Object.keys(updates);
    const values = Object.values(updates);

    if (keys.length === 0) return this.findById(id);

    const updateClause = keys.map(k => `${k} = ?`).join(', ');
    await pool.query(
      `UPDATE geofences SET ${updateClause}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM geofences WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

export const geofencesModel = new GeofencesModel();
