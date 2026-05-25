import { pool } from '../../config/database';
import { TrackingLog, CreateTrackingLogDTO } from '../../types/tracking.types';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class TrackingModel {
  async findById(id: number): Promise<TrackingLog | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM tracking_logs WHERE id = ?',
      [id]
    );
    return rows.length ? (rows[0] as TrackingLog) : null;
  }

  async findLatestByDeviceId(deviceId: number): Promise<TrackingLog | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM tracking_logs WHERE device_id = ? ORDER BY timestamp DESC LIMIT 1',
      [deviceId]
    );
    return rows.length ? (rows[0] as TrackingLog) : null;
  }

  async findByDeviceId(deviceId: number, limit: number = 100, offset: number = 0): Promise<{ logs: TrackingLog[]; total: number }> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM tracking_logs WHERE device_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?',
      [deviceId, limit, offset]
    );

    const [countResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM tracking_logs WHERE device_id = ?',
      [deviceId]
    );

    return {
      logs: rows as TrackingLog[],
      total: (countResult[0] as any).total,
    };
  }

  async create(data: CreateTrackingLogDTO): Promise<TrackingLog> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO tracking_logs (device_id, lat, lng, accuracy, speed, timestamp) VALUES (?, ?, ?, ?, ?, NOW())',
      [data.device_id, data.lat, data.lng, data.accuracy, data.speed]
    );

    const log = await this.findById(result.insertId);
    if (!log) throw new Error('Failed to create tracking log');
    return log;
  }

  async findLocationHistory(deviceId: number, startDate: Date, endDate: Date, limit: number = 500): Promise<TrackingLog[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM tracking_logs WHERE device_id = ? AND timestamp BETWEEN ? AND ? ORDER BY timestamp ASC LIMIT ?',
      [deviceId, startDate, endDate, limit]
    );
    return rows as TrackingLog[];
  }
}

export const trackingModel = new TrackingModel();
