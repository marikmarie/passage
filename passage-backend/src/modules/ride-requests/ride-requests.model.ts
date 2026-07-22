import { pool } from '../../config/database';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export type VehicleType = 'boda' | 'tuktuk';
export type JourneyType = 'morning_to_school' | 'afternoon_return' | 'custom';
export type RideRequestStatus =
  | 'pending_assignment'
  | 'assigned'
  | 'accepted'
  | 'rider_declined'
  | 'cancelled'
  | 'in_transit'
  | 'completed';

export interface RideRequest {
  id: number;
  parent_user_id: number;
  kid_id: number;
  device_id: number | null;
  requested_vehicle_type: VehicleType;
  fare_amount: number;
  journey_type: JourneyType;
  pickup_label: string | null;
  pickup_lat: number;
  pickup_lng: number;
  destination_label: string | null;
  destination_lat: number;
  destination_lng: number;
  status: RideRequestStatus;
  assigned_rider_id: number | null;
  assigned_at: Date | null;
  accepted_at: Date | null;
  declined_at: Date | null;
  cancelled_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface RideRequestDetails extends RideRequest {
  child_name: string | null;
  child_school: string | null;
  child_grade: string | null;
  rider_user_id: number | null;
  rider_name: string | null;
  rider_phone_number: string | null;
  rider_vehicle_type: VehicleType | null;
  rider_number_plate: string | null;
  rider_lat: number | null;
  rider_lng: number | null;
  rider_last_seen_at: Date | null;
  trip_id: number | null;
}

export interface CreateRideRequestDTO {
  parent_user_id: number;
  kid_id: number;
  device_id: number | null;
  requested_vehicle_type: VehicleType;
  fare_amount: number;
  journey_type: JourneyType;
  pickup_label?: string | null;
  pickup_lat: number;
  pickup_lng: number;
  destination_label?: string | null;
  destination_lat: number;
  destination_lng: number;
  assigned_rider_id?: number | null;
  status?: RideRequestStatus;
}

export interface RiderAvailability {
  rider_id: number;
  user_id: number;
  name: string | null;
  phone_number: string | null;
  vehicle_type: VehicleType;
  lat: number;
  lng: number;
  distance_meters: number;
  last_seen_at: Date;
}

export interface UpsertRiderAvailabilityDTO {
  rider_id: number;
  vehicle_type: VehicleType;
  lat: number;
  lng: number;
  is_available: boolean;
}

const NON_TERMINAL_STATUSES = "'pending_assignment', 'assigned', 'accepted', 'in_transit'";

export class RideRequestsModel {
  async findById(id: number): Promise<RideRequestDetails | null> {
    const [rows] = await pool.query<RowDataPacket[]>(this.detailsQuery('rr.id = ?'), [id]);
    return rows.length ? (rows[0] as RideRequestDetails) : null;
  }

  async findActiveForParent(parentUserId: number): Promise<RideRequestDetails | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `${this.detailsQuery(`rr.parent_user_id = ? AND rr.status IN (${NON_TERMINAL_STATUSES})`)} ORDER BY rr.created_at DESC LIMIT 1`,
      [parentUserId]
    );
    return rows.length ? (rows[0] as RideRequestDetails) : null;
  }

  async findActiveForRiderUser(riderUserId: number): Promise<RideRequestDetails | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `${this.detailsQuery(`r.user_id = ? AND rr.status IN ('assigned', 'accepted', 'in_transit')`)} ORDER BY rr.created_at DESC LIMIT 1`,
      [riderUserId]
    );
    return rows.length ? (rows[0] as RideRequestDetails) : null;
  }

  async findByParent(parentUserId: number, limit: number, offset: number): Promise<{ requests: RideRequestDetails[]; total: number }> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `${this.detailsQuery('rr.parent_user_id = ?')} ORDER BY rr.created_at DESC LIMIT ? OFFSET ?`,
      [parentUserId, limit, offset]
    );

    const [countRows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM ride_requests WHERE parent_user_id = ?',
      [parentUserId]
    );

    return { requests: rows as RideRequestDetails[], total: Number(countRows[0].total) };
  }

  async findByRiderUser(riderUserId: number, limit: number, offset: number): Promise<{ requests: RideRequestDetails[]; total: number }> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `${this.detailsQuery('r.user_id = ?')} ORDER BY rr.created_at DESC LIMIT ? OFFSET ?`,
      [riderUserId, limit, offset]
    );

    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total
       FROM ride_requests rr
       JOIN riders r ON r.id = rr.assigned_rider_id
       WHERE r.user_id = ?`,
      [riderUserId]
    );

    return { requests: rows as RideRequestDetails[], total: Number(countRows[0].total) };
  }

  async create(data: CreateRideRequestDTO): Promise<RideRequestDetails> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO ride_requests (
         parent_user_id, kid_id, device_id, requested_vehicle_type, fare_amount, journey_type,
         pickup_label, pickup_lat, pickup_lng, destination_label, destination_lat, destination_lng,
         status, assigned_rider_id, assigned_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.parent_user_id,
        data.kid_id,
        data.device_id,
        data.requested_vehicle_type,
        data.fare_amount,
        data.journey_type,
        data.pickup_label || null,
        data.pickup_lat,
        data.pickup_lng,
        data.destination_label || null,
        data.destination_lat,
        data.destination_lng,
        data.status || 'pending_assignment',
        data.assigned_rider_id || null,
        data.assigned_rider_id ? new Date() : null,
      ]
    );

    const request = await this.findById(result.insertId);
    if (!request) throw new Error('Failed to create ride request');
    return request;
  }

  async updateStatus(id: number, status: RideRequestStatus, fields: Record<string, any> = {}): Promise<RideRequestDetails | null> {
    const updates = { ...fields, status };
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const updateClause = keys.map((key) => `${key} = ?`).join(', ');

    await pool.query(
      `UPDATE ride_requests SET ${updateClause}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );

    return this.findById(id);
  }

  async findNearestAvailableRider(vehicleType: VehicleType, pickupLat: number, pickupLng: number, excludedRiderIds: number[] = []): Promise<RiderAvailability | null> {
    const params: any[] = [pickupLat, pickupLng, pickupLat, vehicleType];
    let excludedClause = '';

    if (excludedRiderIds.length > 0) {
      excludedClause = `AND r.id NOT IN (${excludedRiderIds.map(() => '?').join(', ')})`;
      params.push(...excludedRiderIds);
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         r.id AS rider_id,
         r.user_id,
         u.name,
         u.phone_number,
         ra.vehicle_type,
         ra.lat,
         ra.lng,
         ra.last_seen_at,
         (
           6371000 * ACOS(
             COS(RADIANS(?)) * COS(RADIANS(ra.lat)) * COS(RADIANS(ra.lng) - RADIANS(?)) +
             SIN(RADIANS(?)) * SIN(RADIANS(ra.lat))
           )
         ) AS distance_meters
       FROM rider_availability ra
       JOIN riders r ON r.id = ra.rider_id
       JOIN users u ON u.id = r.user_id
       WHERE ra.is_available = TRUE
         AND ra.vehicle_type = ?
         AND u.status = 'active'
         AND r.approval_status = 'approved'
         AND NOT EXISTS (
           SELECT 1
           FROM ride_requests active_rr
           WHERE active_rr.assigned_rider_id = r.id
             AND active_rr.status IN ('assigned', 'accepted', 'in_transit')
         )
         ${excludedClause}
       ORDER BY distance_meters ASC
       LIMIT 1`,
      params
    );

    return rows.length ? (rows[0] as RiderAvailability) : null;
  }

  async upsertRiderAvailability(data: UpsertRiderAvailabilityDTO): Promise<RiderAvailability | null> {
    await pool.query(
      `INSERT INTO rider_availability (rider_id, vehicle_type, lat, lng, is_available, last_seen_at)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         vehicle_type = VALUES(vehicle_type),
         lat = VALUES(lat),
         lng = VALUES(lng),
         is_available = VALUES(is_available),
         last_seen_at = NOW(),
         updated_at = NOW()`,
      [data.rider_id, data.vehicle_type, data.lat, data.lng, data.is_available]
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         r.id AS rider_id,
         r.user_id,
         u.name,
         u.phone_number,
         ra.vehicle_type,
         ra.lat,
         ra.lng,
         0 AS distance_meters,
         ra.last_seen_at
       FROM rider_availability ra
       JOIN riders r ON r.id = ra.rider_id
       JOIN users u ON u.id = r.user_id
       WHERE r.id = ?`,
      [data.rider_id]
    );

    return rows.length ? (rows[0] as RiderAvailability) : null;
  }

  async createTripFromAcceptedRequest(request: RideRequestDetails): Promise<number | null> {
    if (!request.assigned_rider_id || !request.device_id) {
      return null;
    }

    const [existingRows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM trips WHERE ride_request_id = ? LIMIT 1',
      [request.id]
    );

    if (existingRows.length) {
      return Number(existingRows[0].id);
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO trips
       (rider_id, device_id, ride_request_id, start_time, distance_km, fare_amount, status)
       VALUES (?, ?, ?, NULL, ?, ?, ?)`,
      [request.assigned_rider_id, request.device_id, request.id, 0, request.fare_amount, 'awaiting_pickup']
    );

    await pool.query(
      `UPDATE devices
       SET current_state = 'RIDE_ASSIGNED', last_online_at = NOW()
       WHERE id = ?`,
      [request.device_id]
    );

    return result.insertId;
  }

  async cancelLinkedTrip(rideRequestId: number): Promise<void> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, device_id
       FROM trips
       WHERE ride_request_id = ?
         AND status IN ('awaiting_pickup', 'active')
       LIMIT 1`,
      [rideRequestId]
    );
    if (!rows.length) return;

    await pool.query(
      `UPDATE trips SET status = 'cancelled', updated_at = NOW() WHERE id = ?`,
      [rows[0].id]
    );
    await pool.query(
      `UPDATE devices
       SET current_state = 'IDLE_READY', last_online_at = NOW()
       WHERE id = ?`,
      [rows[0].device_id]
    );
  }

  private detailsQuery(whereClause: string): string {
    return `SELECT
       rr.*,
       k.name AS child_name,
       k.school AS child_school,
       k.grade AS child_grade,
       r.user_id AS rider_user_id,
       u.name AS rider_name,
       u.phone_number AS rider_phone_number,
       ra.vehicle_type AS rider_vehicle_type,
       r.number_plate AS rider_number_plate,
       ra.lat AS rider_lat,
       ra.lng AS rider_lng,
       ra.last_seen_at AS rider_last_seen_at,
       t.id AS trip_id
     FROM ride_requests rr
     JOIN kids k ON k.id = rr.kid_id
     LEFT JOIN riders r ON r.id = rr.assigned_rider_id
     LEFT JOIN users u ON u.id = r.user_id
     LEFT JOIN rider_availability ra ON ra.rider_id = rr.assigned_rider_id
     LEFT JOIN trips t ON t.ride_request_id = rr.id
     WHERE ${whereClause}`;
  }
}

export const rideRequestsModel = new RideRequestsModel();
