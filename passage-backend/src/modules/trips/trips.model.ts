import { pool } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface Trip {
  id: number;
  rider_id: number;
  device_id: number;
  start_time: Date;
  end_time?: Date;
  distance_km: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export class TripsModel {
  async findById(id: number): Promise<Trip | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM trips WHERE id = ?',
      [id]
    );
    return rows.length ? (rows[0] as Trip) : null;
  }

  async findByRiderId(riderId: number, limit: number = 10, offset: number = 0): Promise<{ trips: Trip[]; total: number }> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM trips WHERE rider_id = ? ORDER BY start_time DESC LIMIT ? OFFSET ?',
      [riderId, limit, offset]
    );

    const [countResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM trips WHERE rider_id = ?',
      [riderId]
    );

    return {
      trips: rows as Trip[],
      total: (countResult[0] as any).total,
    };
  }

  async create(data: any): Promise<Trip> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO trips (rider_id, device_id, start_time, distance_km, status) VALUES (?, ?, NOW(), ?, ?)',
      [data.rider_id, data.device_id, 0, 'active']
    );

    const trip = await this.findById(result.insertId);
    if (!trip) throw new Error('Failed to create trip');
    return trip;
  }

  async update(id: number, updates: any): Promise<Trip | null> {
    const keys = Object.keys(updates);
    const values = Object.values(updates);

    if (keys.length === 0) return this.findById(id);

    const updateClause = keys.map(k => `${k} = ?`).join(', ');
    await pool.query(
      `UPDATE trips SET ${updateClause}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );

    return this.findById(id);
  }
}

export const tripsModel = new TripsModel();
