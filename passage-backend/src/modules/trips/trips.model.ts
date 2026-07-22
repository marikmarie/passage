import { pool } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface Trip {
  id: number;
  rider_id: number;
  device_id: number;
  start_time: Date | null;
  end_time?: Date;
  distance_km: number;
  fare_amount: number;
  status: 'awaiting_pickup' | 'active' | 'completed' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface TripAccessDetails {
  trip_id: number;
  rider_id: number;
  rider_user_id: number;
  device_id: number;
  parent_user_id: number | null;
  ride_request_id: number | null;
  trip_status: Trip['status'];
  ride_request_status: string | null;
  device_state: string | null;
  fare_amount: number;
}

export interface ActiveTripDetails extends Trip {
  rider_user_id: number;
  rider_name: string | null;
  rider_phone_number: string | null;
  rider_vehicle_type: string | null;
  rider_number_plate: string | null;
  child_id: number | null;
  child_name: string | null;
  child_school: string | null;
  child_grade: string | null;
  parent_user_id: number | null;
  device_imei: string | null;
  battery_level: number | null;
  current_state: string | null;
  last_online_at: Date | null;
  latest_lat: number | null;
  latest_lng: number | null;
  latest_accuracy: number | null;
  latest_speed: number | null;
  latest_timestamp: Date | null;
  pickup_label: string | null;
  pickup_lat: number | null;
  pickup_lng: number | null;
  destination_label: string | null;
  destination_lat: number | null;
  destination_lng: number | null;
}

export class TripsModel {
  async findById(id: number): Promise<Trip | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM trips WHERE id = ?',
      [id]
    );
    return rows.length ? (rows[0] as Trip) : null;
  }

  async findAccessDetails(id: number): Promise<TripAccessDetails | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         t.id AS trip_id,
         t.rider_id,
         r.user_id AS rider_user_id,
         t.device_id,
         k.parent_user_id,
         t.ride_request_id,
         t.status AS trip_status,
         rr.status AS ride_request_status,
         d.current_state AS device_state,
         t.fare_amount
       FROM trips t
       JOIN riders r ON r.id = t.rider_id
       JOIN devices d ON d.id = t.device_id
       LEFT JOIN kids k ON k.device_id = t.device_id
       LEFT JOIN ride_requests rr ON rr.id = t.ride_request_id
       WHERE t.id = ?`,
      [id]
    );

    return rows.length ? (rows[0] as TripAccessDetails) : null;
  }

  async findActiveForUser(userId: number, role: string): Promise<ActiveTripDetails | null> {
    const params: any[] = [];
    let scopeClause = '';

    if (role === 'parent') {
      scopeClause = 'AND k.parent_user_id = ?';
      params.push(userId);
    } else if (role === 'rider') {
      scopeClause = 'AND r.user_id = ?';
      params.push(userId);
    } else if (!['admin', 'support'].includes(role)) {
      return null;
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         t.*,
         r.user_id AS rider_user_id,
         rider_user.name AS rider_name,
         rider_user.phone_number AS rider_phone_number,
         r.vehicle_type AS rider_vehicle_type,
         r.number_plate AS rider_number_plate,
         k.id AS child_id,
         k.name AS child_name,
         k.school AS child_school,
         k.grade AS child_grade,
         k.parent_user_id,
         d.imei AS device_imei,
         d.battery_level,
         d.current_state,
         d.last_online_at,
         tl.lat AS latest_lat,
         tl.lng AS latest_lng,
         tl.accuracy AS latest_accuracy,
         tl.speed AS latest_speed,
         tl.timestamp AS latest_timestamp,
         rr.pickup_label,
         rr.pickup_lat,
         rr.pickup_lng,
         rr.destination_label,
         rr.destination_lat,
         rr.destination_lng
       FROM trips t
       JOIN riders r ON r.id = t.rider_id
       JOIN users rider_user ON rider_user.id = r.user_id
       JOIN devices d ON d.id = t.device_id
       LEFT JOIN kids k ON k.device_id = t.device_id
       LEFT JOIN ride_requests rr ON rr.id = t.ride_request_id
       LEFT JOIN tracking_logs tl ON tl.id = (
         SELECT id
         FROM tracking_logs
         WHERE device_id = t.device_id
         ORDER BY timestamp DESC
         LIMIT 1
       )
       WHERE t.status IN ('awaiting_pickup', 'active')
       ${scopeClause}
       ORDER BY COALESCE(t.start_time, t.created_at) DESC
       LIMIT 1`,
      params
    );

    return rows.length ? (rows[0] as ActiveTripDetails) : null;
  }

  async findRiderOwnerUserId(riderId: number): Promise<number | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT user_id FROM riders WHERE id = ?',
      [riderId]
    );

    return rows.length ? Number(rows[0].user_id) : null;
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
      'INSERT INTO trips (rider_id, device_id, start_time, distance_km, status) VALUES (?, ?, NULL, ?, ?)',
      [data.rider_id, data.device_id, 0, 'awaiting_pickup']
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
