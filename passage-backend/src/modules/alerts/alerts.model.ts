import { pool } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface Alert {
  id: number;
  device_id: number;
  rider_id: number;
  type: 'SOS' | 'geofence_breach' | 'low_battery' | 'offline';
  resolved_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export class AlertsModel {
  async findById(id: number): Promise<Alert | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM alerts WHERE id = ?',
      [id]
    );
    return rows.length ? (rows[0] as Alert) : null;
  }

  async findAll(limit: number = 10, offset: number = 0): Promise<{ alerts: Alert[]; total: number }> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM alerts ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const [countResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM alerts'
    );

    return {
      alerts: rows as Alert[],
      total: (countResult[0] as any).total,
    };
  }

  async findByDeviceId(deviceId: number, limit: number = 10, offset: number = 0): Promise<{ alerts: Alert[]; total: number }> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM alerts WHERE device_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [deviceId, limit, offset]
    );

    const [countResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM alerts WHERE device_id = ?',
      [deviceId]
    );

    return {
      alerts: rows as Alert[],
      total: (countResult[0] as any).total,
    };
  }

  async create(data: any): Promise<Alert> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO alerts (device_id, rider_id, type) VALUES (?, ?, ?)',
      [data.device_id, data.rider_id, data.type]
    );

    const alert = await this.findById(result.insertId);
    if (!alert) throw new Error('Failed to create alert');
    return alert;
  }

  async resolve(id: number): Promise<Alert | null> {
    await pool.query(
      'UPDATE alerts SET resolved_at = NOW(), updated_at = NOW() WHERE id = ?',
      [id]
    );

    return this.findById(id);
  }
}

export const alertsModel = new AlertsModel();
