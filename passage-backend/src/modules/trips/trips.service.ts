import { tripsModel, ActiveTripDetails } from './trips.model';
import crypto from 'crypto';
import { pool } from '../../config/database';
import { env } from '../../config/env';
import { routePlanningService } from '../route-planning/route-planning.service';
import { notificationsService } from '../notifications/notifications.service';
import { walletModel } from '../wallet/wallet.model';

export interface ActiveTripResponse {
  trip: {
    id: number;
    status: string;
    start_time: Date | null;
    end_time?: Date;
    distance_km: number;
  };
  child: {
    id: number | null;
    display_name: string;
    name?: string;
    school: string | null;
    grade: string | null;
  };
  rider: {
    id: number;
    user_id: number;
    name: string | null;
    phone_number: string | null;
    vehicle_type: string | null;
    number_plate: string | null;
  };
  device: {
    id: number;
    imei?: string;
    battery_level: number | null;
    current_state: string | null;
    last_online_at: Date | null;
  };
  latest_location: {
    lat: number;
    lng: number;
    accuracy: number | null;
    speed: number | null;
    timestamp: Date | null;
  } | null;
  route: {
    pickup: { label: string | null; lat: number; lng: number } | null;
    destination: { label: string | null; lat: number; lng: number } | null;
    pickup_label?: string | null;
    destination_label?: string | null;
    points: Array<{ lat: number; lng: number }>;
    distance_meters: number | null;
    duration_seconds: number | null;
  };
}

export class TripsService {
  async getTripById(id: number) {
    return tripsModel.findById(id);
  }

  async getTripAccessDetails(id: number) {
    return tripsModel.findAccessDetails(id);
  }

  async getActiveTripForUser(userId: number, role: string): Promise<ActiveTripResponse | null> {
    const activeTrip = await tripsModel.findActiveForUser(userId, role);
    if (!activeTrip) return null;

    return this.toActiveTripResponse(activeTrip, role);
  }

  async getRiderOwnerUserId(riderId: number) {
    return tripsModel.findRiderOwnerUserId(riderId);
  }

  async getTripsByRiderId(riderId: number, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    return tripsModel.findByRiderId(riderId, limit, offset);
  }

  async createTrip(data: any) {
    return tripsModel.create(data);
  }

  async startTrip(id: number, riderUserId: number) {
    const access = await tripsModel.findAccessDetails(id);
    if (!access || access.rider_user_id !== riderUserId) {
      throw this.lifecycleError('Trip does not belong to the authenticated rider.', 404);
    }

    if (access.trip_status !== 'awaiting_pickup' || access.ride_request_status !== 'accepted') {
      throw this.lifecycleError('Only an accepted trip awaiting pickup can be started.', 409);
    }

    if (access.device_state !== 'PICKUP_CONFIRMED') {
      throw this.lifecycleError('Pickup watch verification is required before starting the trip.', 409);
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(
        `UPDATE trips
         SET status = 'active', start_time = NOW(), updated_at = NOW()
         WHERE id = ? AND status = 'awaiting_pickup'`,
        [id]
      );
      if (access.ride_request_id) {
        await connection.query(
          `UPDATE ride_requests
           SET status = 'in_transit', updated_at = NOW()
           WHERE id = ? AND status = 'accepted'`,
          [access.ride_request_id]
        );
      }
      await connection.query(
        `UPDATE devices
         SET current_state = 'IN_TRANSIT', last_online_at = NOW()
         WHERE id = ?`,
        [access.device_id]
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    await notificationsService.createInAppSafely(
      access.parent_user_id,
      'Trip started',
      'Pickup was verified and the journey is now in progress.'
    );

    return tripsModel.findById(id);
  }

  async endTrip(id: number, distance_km: number, requireDropoffVerification = true) {
    const access = await tripsModel.findAccessDetails(id);
    if (!access) throw this.lifecycleError('Trip not found.', 404);
    if (access.trip_status !== 'active') {
      throw this.lifecycleError('Only an active trip can be completed.', 409);
    }
    if (requireDropoffVerification && access.device_state !== 'DROPOFF_CONFIRMED') {
      throw this.lifecycleError('Drop-off watch verification is required before completing the trip.', 409);
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(
        `UPDATE trips
         SET end_time = NOW(), distance_km = ?, status = 'completed', updated_at = NOW()
         WHERE id = ? AND status = 'active'`,
        [distance_km, id]
      );
      if (access.ride_request_id) {
        await connection.query(
          `UPDATE ride_requests
           SET status = 'completed', completed_at = NOW(), updated_at = NOW()
           WHERE id = ?`,
          [access.ride_request_id]
        );
      }
      await connection.query(
        `UPDATE devices
         SET current_state = 'IDLE_READY', last_online_at = NOW()
         WHERE id = ?`,
        [access.device_id]
      );
      if (access.parent_user_id && Number(access.fare_amount) > 0) {
        await walletModel.settleTripFare(
          connection,
          access.parent_user_id,
          access.rider_user_id,
          id,
          Number(access.fare_amount)
        );
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    await Promise.all([
      notificationsService.createInAppSafely(
        access.parent_user_id,
        'Trip completed',
        'Drop-off was verified and the journey was completed safely.'
      ),
      notificationsService.createInAppSafely(
        access.rider_user_id,
        'Journey completed',
        'Drop-off was verified and this journey is now in your trip history.'
      ),
    ]);

    return tripsModel.findById(id);
  }

  async cancelTrip(id: number) {
    const access = await tripsModel.findAccessDetails(id);
    if (!access) return null;
    if (['completed', 'cancelled'].includes(access.trip_status)) {
      throw this.lifecycleError('This trip is already closed.', 409);
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(
        `UPDATE trips SET status = 'cancelled', updated_at = NOW() WHERE id = ?`,
        [id]
      );
      if (access.ride_request_id) {
        await connection.query(
          `UPDATE ride_requests
           SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
           WHERE id = ?`,
          [access.ride_request_id]
        );
      }
      await connection.query(
        `UPDATE devices
         SET current_state = 'IDLE_READY', last_online_at = NOW()
         WHERE id = ?`,
        [access.device_id]
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    await Promise.all([
      notificationsService.createInAppSafely(
        access.parent_user_id,
        'Trip cancelled',
        'The active journey was cancelled.'
      ),
      notificationsService.createInAppSafely(
        access.rider_user_id,
        'Trip cancelled',
        'The active journey was cancelled.'
      ),
    ]);

    return tripsModel.findById(id);
  }

  async assertWatchAction(tripId: number, action: 'PICKUP' | 'DROPOFF'): Promise<void> {
    const access = await tripsModel.findAccessDetails(tripId);
    if (!access) throw this.lifecycleError('Trip not found.', 404);

    const valid = action === 'PICKUP'
      ? access.trip_status === 'awaiting_pickup' && access.ride_request_status === 'accepted'
      : access.trip_status === 'active' && access.ride_request_status === 'in_transit';

    if (!valid) {
      throw this.lifecycleError(
        action === 'PICKUP'
          ? 'Pickup can only be verified for an accepted trip awaiting pickup.'
          : 'Drop-off can only be verified for a trip in transit.',
        409
      );
    }
  }

  async validateQRToken(tripId: number, verificationToken: string, riderUserId: number): Promise<void> {
    if (!verificationToken) {
      throw new Error('Verification token is required');
    }

    const trip = await tripsModel.findById(tripId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    const access = await tripsModel.findAccessDetails(tripId);
    if (!access || access.rider_user_id !== riderUserId) {
      throw new Error('Trip does not belong to the authenticated rider');
    }

    const [payload, signature] = verificationToken.split('.');
    if (!payload || !signature) {
      throw new Error('Invalid verification token format');
    }

    const tokenSecret = env.TOKEN_SECRET;
    if (!tokenSecret) {
      throw new Error('TOKEN_SECRET is not configured');
    }

    const expectedSignature = crypto.createHmac('sha256', tokenSecret).update(payload).digest('hex');
    if (expectedSignature !== signature) {
      throw new Error('Invalid verification token');
    }

    const [deviceIdPart, tokenTripIdPart, issuedAtPart] = payload.split(':');
    const tokenTripId = Number(tokenTripIdPart);
    const tokenDeviceId = Number(deviceIdPart);
    const issuedAt = Number(issuedAtPart);

    if (!Number.isInteger(tokenTripId) || !Number.isInteger(tokenDeviceId) || !Number.isFinite(issuedAt)) {
      throw new Error('Invalid verification token payload');
    }

    if (tokenTripId !== tripId) {
      throw new Error('Verification token does not match this trip');
    }

    if (trip.device_id !== tokenDeviceId) {
      throw new Error('Verification token does not match this device');
    }

    const expiresAt = issuedAt + 2 * 60 * 1000;
    if (Date.now() > expiresAt) {
      throw new Error('Verification token has expired');
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    const [consumeResult] = await pool.query<any>(
      `UPDATE watch_verification_tokens
       SET used_at = NOW()
       WHERE token_hash = ?
         AND trip_id = ?
         AND device_id = ?
         AND used_at IS NULL
         AND expires_at > NOW()`,
      [tokenHash, tripId, trip.device_id]
    );
    if (consumeResult.affectedRows !== 1) {
      throw new Error('Verification token is invalid, expired, or already used');
    }
  }

  async updateTripState(tripId: number, state: string): Promise<void> {
    const trip = await tripsModel.findById(tripId);

    if (!trip) {
      throw new Error('Trip not found');
    }

    await pool.query(
      'UPDATE devices SET current_state = ?, last_online_at = NOW() WHERE id = ?',
      [state, trip.device_id]
    );
  }

  private lifecycleError(message: string, statusCode: number): Error {
    const error = new Error(message);
    (error as any).statusCode = statusCode;
    return error;
  }

  private async buildRoute(trip: ActiveTripDetails): Promise<ActiveTripResponse['route']> {
    const hasPickup = trip.pickup_lat !== null && trip.pickup_lng !== null;
    const hasDestination = trip.destination_lat !== null && trip.destination_lng !== null;
    const pickup = hasPickup
      ? {
          label: trip.pickup_label,
          lat: Number(trip.pickup_lat),
          lng: Number(trip.pickup_lng),
        }
      : null;
    const destination = hasDestination
      ? {
          label: trip.destination_label,
          lat: Number(trip.destination_lat),
          lng: Number(trip.destination_lng),
        }
      : null;

    const fallbackRoute: ActiveTripResponse['route'] = {
      pickup,
      destination,
      pickup_label: trip.pickup_label,
      destination_label: trip.destination_label,
      points: [pickup, destination]
        .filter((point): point is { label: string | null; lat: number; lng: number } => point !== null)
        .map((point) => ({ lat: point.lat, lng: point.lng })),
      distance_meters: null,
      duration_seconds: null,
    };

    if (!pickup || !destination) {
      return fallbackRoute;
    }

    try {
      const directions = await routePlanningService.getDirections({
        start: pickup,
        end: destination,
        profile: 'driving-car',
      });

      return {
        ...fallbackRoute,
        points: directions.route_points,
        distance_meters: directions.distance_meters,
        duration_seconds: directions.duration_seconds,
      };
    } catch {
      return fallbackRoute;
    }
  }

  private async toActiveTripResponse(trip: ActiveTripDetails, role: string): Promise<ActiveTripResponse> {
    const childId = trip.child_id ?? null;
    const canSeeChildName = ['parent', 'admin', 'support'].includes(role);
    const childDisplayName = canSeeChildName && trip.child_name
      ? trip.child_name
      : childId
        ? `Passenger #${childId}`
        : 'Assigned passenger';

    return {
      trip: {
        id: trip.id,
        status: trip.status,
        start_time: trip.start_time,
        end_time: trip.end_time,
        distance_km: Number(trip.distance_km ?? 0),
      },
      child: {
        id: childId,
        display_name: childDisplayName,
        ...(canSeeChildName && trip.child_name ? { name: trip.child_name } : {}),
        school: trip.child_school,
        grade: trip.child_grade,
      },
      rider: {
        id: trip.rider_id,
        user_id: trip.rider_user_id,
        name: trip.rider_name,
        phone_number: trip.rider_phone_number,
        vehicle_type: trip.rider_vehicle_type,
        number_plate: trip.rider_number_plate,
      },
      device: {
        id: trip.device_id,
        ...(canSeeChildName && trip.device_imei ? { imei: trip.device_imei } : {}),
        battery_level: trip.battery_level,
        current_state: trip.current_state,
        last_online_at: trip.last_online_at,
      },
      latest_location: trip.latest_lat !== null && trip.latest_lng !== null
        ? {
            lat: Number(trip.latest_lat),
            lng: Number(trip.latest_lng),
            accuracy: trip.latest_accuracy === null ? null : Number(trip.latest_accuracy),
            speed: trip.latest_speed === null ? null : Number(trip.latest_speed),
            timestamp: trip.latest_timestamp,
          }
        : null,
      route: await this.buildRoute(trip),
    };
  }
}

export const tripsService = new TripsService();
