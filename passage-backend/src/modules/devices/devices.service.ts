import { devicesModel } from './devices.model';
import { Device, CreateDeviceDTO, UpdateDeviceDTO } from '../../types/device.types';
import { getPaginationOptions, calculateOffset } from '../../utils/pagination.util';
import { pool } from '../../config/database';


const crypto = require('crypto');

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

  async determineWatchState(deviceId: number): Promise<WatchStateData> {
    const [rows] = await pool.query<any[]>(
      `SELECT t.id AS tripId, d.current_state
       FROM trips t
       JOIN devices d ON d.id = t.device_id
       WHERE d.id = ? AND t.status = 'active'
       ORDER BY t.start_time DESC
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
    const tokenSecret = process.env.TOKEN_SECRET;

    if (!tokenSecret) {
      throw new Error('TOKEN_SECRET is not configured');
    }

    const issuedAt = Date.now();
    const rawData = `${deviceId}:${tripId}:${issuedAt}:${crypto.randomBytes(8).toString('hex')}`;
    const signature = crypto.createHmac('sha256', tokenSecret).update(rawData).digest('hex');

    return {
      token: `${rawData}.${signature}`,
      expiresAt: new Date(issuedAt + 2 * 60 * 1000).toISOString(),
    };
    }



  async getAllDevices(page?: string | number, limit?: string | number): Promise<any> {
    const { page: p, limit: l } = getPaginationOptions(page, limit);
    const offset = calculateOffset(p, l);

    const { devices, total } = await devicesModel.findAll(l, offset);

    return {
      devices,
      pagination: {
        total,
        page: p,
        limit: l,
        pages: Math.ceil(total / l),
      },
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
