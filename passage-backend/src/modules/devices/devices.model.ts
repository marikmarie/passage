import { pool } from '../../config/database';
import { Device, CreateDeviceDTO, UpdateDeviceDTO } from '../../types/device.types';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class DevicesModel {
  async findById(id: number): Promise<Device | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM devices WHERE id = ?',
      [id]
    );
    return rows.length ? (rows[0] as Device) : null;
  }

  async findByRiderId(riderId: number): Promise<Device | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM devices WHERE rider_id = ?',
      [riderId]
    );
    return rows.length ? (rows[0] as Device) : null;
  }

  async findAll(limit: number = 10, offset: number = 0): Promise<{ devices: Device[]; total: number }> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM devices LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const [countResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM devices'
    );

    return {
      devices: rows as Device[],
      total: (countResult[0] as any).total,
    };
  }

  async create(data: CreateDeviceDTO): Promise<Device> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO devices (rider_id, imei, sim_number, firmware_version, battery_level, status) VALUES (?, ?, ?, ?, ?, ?)',
      [data.rider_id, data.imei, data.sim_number, data.firmware_version, 100, 'active']
    );

    const device = await this.findById(result.insertId);
    if (!device) throw new Error('Failed to create device');
    return device;
  }

  async update(id: number, updates: UpdateDeviceDTO): Promise<Device | null> {
    const keys = Object.keys(updates);
    const values = Object.values(updates);

    if (keys.length === 0) return this.findById(id);

    const updateClause = keys.map(k => `${k} = ?`).join(', ');
    await pool.query(
      `UPDATE devices SET ${updateClause}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM devices WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

export const devicesModel = new DevicesModel();
