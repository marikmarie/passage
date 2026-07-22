import { devicesModel } from './devices.model';
import { Device, CreateDeviceDTO, UpdateDeviceDTO } from '../../types/device.types';
import { getPaginationOptions, calculateOffset } from '../../utils/pagination.util';
import { pool } from '../../config/database';
import { env } from '../../config/env';

const crypto = require('crypto');

const PRIVILEGED_ROLES = ['admin', 'support'];

export interface AuthUserRef {
  id: number;
  role: string;
  email?: string;
}

export interface WatchStateData {
  state: string;
  tripId: number | null;
  message: string;
  interval: number;
}

export interface SaveLocationDTO {
  deviceId: number;
  tripId?: number | null;
  lat: number;
  lng: number;
  accuracy?: number;
  speed?: number;
  bearing?: number;
  battery?: number;
  timestamp?: string | Date;
}

export interface ProcessEventDTO {
  deviceId: number;
  tripId?: number | null;
  eventType: string;
  battery?: number;
  timestamp?: string | Date;
}

export class DevicesService {
  async getDeviceById(id: number): Promise<Device | null> {
    return devicesModel.findById(id);
  }

  async canAccessDevice(user: AuthUserRef | undefined, deviceId: number): Promise<boolean> {
    if (!user) return false;
    if (PRIVILEGED_ROLES.includes(user.role)) return true;

    if (user.role === 'parent') {
      const [rows] = await pool.query<any[]>(
        'SELECT id FROM kids WHERE device_id = ? AND parent_user_id = ? LIMIT 1',
        [deviceId, user.id]
      );
      return rows.length > 0;
    }

    if (user.role === 'rider') {
      const [rows] = await pool.query<any[]>(
        `SELECT t.id
         FROM trips t
         JOIN riders r ON r.id = t.rider_id
         WHERE t.device_id = ?
           AND r.user_id = ?
           AND t.status IN ('awaiting_pickup', 'active')
         LIMIT 1`,
        [deviceId, user.id]
      );
      return rows.length > 0;
    }

    return false;
  }

  async determineWatchState(deviceId: number): Promise<WatchStateData> {
    const [rows] = await pool.query<any[]>(
      `SELECT t.id AS tripId, d.current_state
       FROM trips t
       JOIN devices d ON d.id = t.device_id
       WHERE d.id = ? AND t.status IN ('awaiting_pickup', 'active')
       ORDER BY COALESCE(t.start_time, t.created_at) DESC
       LIMIT 1`,
      [deviceId]
    );

    if (!rows.length) {
      return { state: 'IDLE_READY', tripId: null, message: 'Ready', interval: 180 };
    }

    const activeTrip = rows[0];
    let interval = 30;
    let message = '';

    switch (activeTrip.current_state) {
      case 'RIDE_ASSIGNED':
      case 'DRIVER_NEARBY':
        interval = 45;
        message = 'Please get ready';
        break;
      case 'IN_TRANSIT':
        interval = 15;
        message = 'In Transit';
        break;
      case 'SOS_ACTIVE':
        interval = 5;
        message = 'SOS Triggered';
        break;
      default:
        message = 'Ready';
        break;
    }

    return { state: activeTrip.current_state, tripId: activeTrip.tripId, message, interval };
  }

  async saveLocation(data: SaveLocationDTO): Promise<void> {
    if (
      !Number.isFinite(Number(data.lat)) ||
      !Number.isFinite(Number(data.lng)) ||
      Number(data.lat) < -90 ||
      Number(data.lat) > 90 ||
      Number(data.lng) < -180 ||
      Number(data.lng) > 180
    ) {
      throw new Error('Location must include valid lat and lng values');
    }

    if (data.tripId) {
      const [tripRows] = await pool.query<any[]>(
        `SELECT id
         FROM trips
         WHERE id = ?
           AND device_id = ?
           AND status IN ('awaiting_pickup', 'active')
         LIMIT 1`,
        [data.tripId, data.deviceId]
      );
      if (!tripRows.length) {
        throw new Error('Trip does not belong to this device or is not active');
      }
    }

    const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();

    await pool.query(
      'INSERT INTO tracking_logs (device_id, lat, lng, accuracy, speed, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
      [
        data.deviceId,
        data.lat,
        data.lng,
        data.accuracy ?? null,
        data.speed ?? 0,
        timestamp,
      ]
    );

    if (typeof data.battery === 'number') {
      await pool.query(
        'UPDATE devices SET battery_level = ?, last_online_at = NOW() WHERE id = ?',
        [data.battery, data.deviceId]
      );
      return;
    }

    await pool.query('UPDATE devices SET last_online_at = NOW() WHERE id = ?', [data.deviceId]);
  }

  async processEvent(
    deviceId: number,
    tripId: number | null | undefined,
    eventType: string,
    battery?: number,
    timestamp?: string | Date,
  ): Promise<void> {
    const eventTimestamp = timestamp ? new Date(timestamp) : new Date();

    const updates: string[] = ['current_state = ?', 'last_online_at = ?'];
    const values: Array<string | number | Date> = [eventType, eventTimestamp];

    if (typeof battery === 'number') {
      updates.push('battery_level = ?');
      values.push(battery);
    }

    values.push(deviceId);
    await pool.query(`UPDATE devices SET ${updates.join(', ')} WHERE id = ?`, values);

    if (tripId) {
      await pool.query('UPDATE trips SET updated_at = NOW() WHERE id = ?', [tripId]);
    }
  }

  async generateVerificationToken(deviceId: number, tripId: number): Promise<{ token: string; expiresAt: string }> {
    const tokenSecret = env.TOKEN_SECRET;

    if (!tokenSecret) {
      throw new Error('TOKEN_SECRET is not configured');
    }

    const [tripRows] = await pool.query<any[]>(
      `SELECT id
       FROM trips
       WHERE id = ?
         AND device_id = ?
         AND status IN ('awaiting_pickup', 'active')
       LIMIT 1`,
      [tripId, deviceId]
    );
    if (!tripRows.length) {
      throw new Error('Trip does not belong to this device or is not active');
    }

    const issuedAt = Date.now();
    const rawData = `${deviceId}:${tripId}:${issuedAt}:${crypto.randomBytes(8).toString('hex')}`;
    const signature = crypto.createHmac('sha256', tokenSecret).update(rawData).digest('hex');
    const token = `${rawData}.${signature}`;
    const expiresAt = new Date(issuedAt + 2 * 60 * 1000);
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await pool.query(
      `INSERT INTO watch_verification_tokens
         (trip_id, device_id, token_hash, expires_at)
       VALUES (?, ?, ?, ?)`,
      [tripId, deviceId, tokenHash, expiresAt]
    );

    return {
      token,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async getAllDevices(page?: string | number, limit?: string | number): Promise<any> {
    const { page: p, limit: l } = getPaginationOptions(page, limit);
    const offset = calculateOffset(p, l);

    const { devices, total } = await devicesModel.findAll(l, offset);

    return {
      data: devices,
      total,
    };
  }

  async createDevice(data: CreateDeviceDTO): Promise<Device> {
    return devicesModel.create(data);
  }

  async updateDevice(id: number, updates: UpdateDeviceDTO): Promise<Device | null> {
    return devicesModel.update(id, updates);
  }

  async deleteDevice(id: number): Promise<boolean> {
    return devicesModel.delete(id);
  }
}

export const devicesService = new DevicesService();
