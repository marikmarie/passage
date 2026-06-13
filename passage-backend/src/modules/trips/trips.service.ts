import { tripsModel } from './trips.model';
import crypto from 'crypto';
import { pool } from '../../config/database';

export class TripsService {
  async getTripById(id: number) {
    return tripsModel.findById(id);
  }


  
  async getTripsByRiderId(riderId: number, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    return tripsModel.findByRiderId(riderId, limit, offset);
  }

  async createTrip(data: any) {
    return tripsModel.create(data);
  }

  async endTrip(id: number, distance_km: number) {
    return tripsModel.update(id, {
      end_time: new Date(),
      distance_km,
      status: 'completed',
    });
  }

  async cancelTrip(id: number) {
    return tripsModel.update(id, {
      status: 'cancelled',
    });
  }

  async validateQRToken(tripId: number, verificationToken: string, riderId: number): Promise<void> {
    if (!verificationToken) {
      throw new Error('Verification token is required');
    }

    const trip = await tripsModel.findById(tripId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    if (trip.rider_id !== riderId) {
      throw new Error('Trip does not belong to the authenticated rider');
    }

    const [payload, signature] = verificationToken.split('.');
    if (!payload || !signature) {
      throw new Error('Invalid verification token format');
    }

    const tokenSecret = process.env.TOKEN_SECRET;
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
}



export const tripsService = new TripsService();
