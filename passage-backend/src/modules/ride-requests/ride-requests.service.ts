import { kidsModel } from '../kids/kids.model';
import { ridersModel } from '../riders/riders.model';
import {
  CreateRideRequestDTO,
  JourneyType,
  RideRequestDetails,
  RiderAvailability,
  UpsertRiderAvailabilityDTO,
  VehicleType,
  rideRequestsModel,
} from './ride-requests.model';
import { notificationsService } from '../notifications/notifications.service';
import { walletModel } from '../wallet/wallet.model';

const VEHICLE_TYPES = new Set(['boda', 'tuktuk']);
const JOURNEY_TYPES = new Set(['morning_to_school', 'afternoon_return', 'custom']);
const PRIVILEGED_ROLES = new Set(['admin', 'support']);

export interface CoordinateInput {
  lat: number;
  lng: number;
  label?: string | null;
}

export interface CreateRideRequestInput {
  kid_id: number;
  vehicle_type: VehicleType;
  journey_type?: JourneyType;
  pickup: CoordinateInput;
  destination: CoordinateInput;
}

export interface RideRequestResponse {
  id: number;
  status: string;
  requested_vehicle_type: VehicleType;
  fare_amount: number;
  journey_type: JourneyType;
  pickup: {
    label: string | null;
    lat: number;
    lng: number;
  };
  destination: {
    label: string | null;
    lat: number;
    lng: number;
  };
  child: {
    id: number;
    display_name: string;
    name?: string;
    school: string | null;
    grade: string | null;
  };
  rider: {
    id: number;
    user_id: number | null;
    name: string | null;
    phone_number: string | null;
    vehicle_type: VehicleType | null;
    number_plate: string | null;
    lat: number | null;
    lng: number | null;
    last_seen_at: Date | null;
  } | null;
  trip_id: number | null;
  created_at: Date;
  assigned_at: Date | null;
  accepted_at: Date | null;
  declined_at: Date | null;
  cancelled_at: Date | null;
  completed_at: Date | null;
}

export class RideRequestsService {
  async create(parentUserId: number, input: CreateRideRequestInput): Promise<RideRequestResponse> {
    this.assertVehicleType(input.vehicle_type);
    const journeyType = input.journey_type || 'custom';
    this.assertJourneyType(journeyType);
    this.assertCoordinate(input.pickup, 'pickup');
    this.assertCoordinate(input.destination, 'destination');
    const fareAmount = input.vehicle_type === 'boda' ? 8000 : 12000;
    await walletModel.assertAvailableBalance(parentUserId, fareAmount);

    const kid = await kidsModel.findById(Number(input.kid_id));
    if (!kid || kid.parent_user_id !== parentUserId) {
      const error = new Error('Child not found for this parent.');
      (error as any).statusCode = 404;
      throw error;
    }

    const activeRequest = await rideRequestsModel.findActiveForParent(parentUserId);
    if (activeRequest) {
      const error = new Error('This parent already has an active ride request.');
      (error as any).statusCode = 409;
      throw error;
    }

    const nearestRider = await rideRequestsModel.findNearestAvailableRider(
      input.vehicle_type,
      input.pickup.lat,
      input.pickup.lng
    );

    const data: CreateRideRequestDTO = {
      parent_user_id: parentUserId,
      kid_id: kid.id,
      device_id: kid.device_id || null,
      requested_vehicle_type: input.vehicle_type,
      fare_amount: fareAmount,
      journey_type: journeyType,
      pickup_label: input.pickup.label || null,
      pickup_lat: input.pickup.lat,
      pickup_lng: input.pickup.lng,
      destination_label: input.destination.label || kid.school || null,
      destination_lat: input.destination.lat,
      destination_lng: input.destination.lng,
      assigned_rider_id: nearestRider?.rider_id || null,
      status: nearestRider ? 'assigned' : 'pending_assignment',
    };

    const request = await rideRequestsModel.create(data);
    await notificationsService.createInAppSafely(
      parentUserId,
      nearestRider ? 'Rider assigned' : 'Finding your rider',
      nearestRider
        ? 'A verified rider has been assigned to your journey request.'
        : 'Your journey request is active while PASSAGE finds an eligible rider.'
    );
    if (nearestRider) {
      await notificationsService.createInAppSafely(
        nearestRider.user_id,
        'New journey assignment',
        `A ${input.vehicle_type} journey is waiting for your response near ${input.pickup.label || 'the pickup point'}.`
      );
    }
    return this.toResponse(request, 'parent');
  }

  async getActive(userId: number, role: string): Promise<RideRequestResponse | null> {
    const request = role === 'parent'
      ? await rideRequestsModel.findActiveForParent(userId)
      : role === 'rider'
        ? await rideRequestsModel.findActiveForRiderUser(userId)
        : PRIVILEGED_ROLES.has(role)
          ? null
          : null;

    return request ? this.toResponse(request, role) : null;
  }

  async getById(id: number, userId: number, role: string): Promise<RideRequestResponse | null> {
    const request = await rideRequestsModel.findById(id);
    if (!request || !this.canAccess(request, userId, role)) {
      return null;
    }

    return this.toResponse(request, role);
  }

  async listForUser(userId: number, role: string, page: number, limit: number): Promise<{ requests: RideRequestResponse[]; total: number }> {
    const offset = (page - 1) * limit;

    if (role === 'parent') {
      const result = await rideRequestsModel.findByParent(userId, limit, offset);
      return {
        total: result.total,
        requests: result.requests.map((request) => this.toResponse(request, role)),
      };
    }

    if (role === 'rider') {
      const result = await rideRequestsModel.findByRiderUser(userId, limit, offset);
      return {
        total: result.total,
        requests: result.requests.map((request) => this.toResponse(request, role)),
      };
    }

    const error = new Error('Ride request listing is only available for parent and rider users.');
    (error as any).statusCode = 403;
    throw error;
  }

  async accept(id: number, riderUserId: number): Promise<RideRequestResponse> {
    await this.assertApprovedRider(riderUserId);
    const request = await this.getAssignedRequestForRider(id, riderUserId);

    if (request.status !== 'assigned') {
      const error = new Error('Only assigned ride requests can be accepted.');
      (error as any).statusCode = 409;
      throw error;
    }

    const accepted = await rideRequestsModel.updateStatus(id, 'accepted', { accepted_at: new Date() });
    if (!accepted) throw new Error('Ride request not found.');

    await rideRequestsModel.createTripFromAcceptedRequest(accepted);
    const refreshed = await rideRequestsModel.findById(id);
    if (!refreshed) throw new Error('Ride request not found after accepting.');

    await notificationsService.createInAppSafely(
      refreshed.parent_user_id,
      'Rider accepted',
      'Your assigned rider accepted the journey and is preparing for pickup.'
    );

    return this.toResponse(refreshed, 'rider');
  }

  async decline(id: number, riderUserId: number): Promise<RideRequestResponse> {
    await this.assertApprovedRider(riderUserId);
    const request = await this.getAssignedRequestForRider(id, riderUserId);

    if (request.status !== 'assigned') {
      const error = new Error('Only assigned ride requests can be declined.');
      (error as any).statusCode = 409;
      throw error;
    }
    const excludedRiderIds = request.assigned_rider_id ? [request.assigned_rider_id] : [];

    const nextRider = await rideRequestsModel.findNearestAvailableRider(
      request.requested_vehicle_type,
      Number(request.pickup_lat),
      Number(request.pickup_lng),
      excludedRiderIds
    );

    const reassigned = await rideRequestsModel.updateStatus(
      id,
      nextRider ? 'assigned' : 'pending_assignment',
      {
        assigned_rider_id: nextRider?.rider_id || null,
        assigned_at: nextRider ? new Date() : null,
        declined_at: new Date(),
      }
    );

    if (!reassigned) throw new Error('Ride request not found after declining.');

    await notificationsService.createInAppSafely(
      reassigned.parent_user_id,
      nextRider ? 'A new rider was assigned' : 'Finding another rider',
      nextRider
        ? 'PASSAGE reassigned your journey request to another verified rider.'
        : 'The previous rider declined. Your request remains active while PASSAGE searches again.'
    );
    if (nextRider) {
      await notificationsService.createInAppSafely(
        nextRider.user_id,
        'New journey assignment',
        `A ${request.requested_vehicle_type} journey is waiting for your response near ${request.pickup_label || 'the pickup point'}.`
      );
    }

    // The declining rider must not receive identity/location details for the
    // next rider selected by the matcher.
    return { ...this.toResponse(reassigned, 'rider'), rider: null };
  }

  async cancel(id: number, parentUserId: number): Promise<RideRequestResponse> {
    const request = await rideRequestsModel.findById(id);
    if (!request || request.parent_user_id !== parentUserId) {
      const error = new Error('Ride request not found for this parent.');
      (error as any).statusCode = 404;
      throw error;
    }

    if (['in_transit', 'completed', 'cancelled'].includes(request.status)) {
      const error = new Error(
        request.status === 'in_transit'
          ? 'An in-transit ride cannot be cancelled from the request flow.'
          : 'This ride request is already closed.'
      );
      (error as any).statusCode = 409;
      throw error;
    }

    const cancelled = await rideRequestsModel.updateStatus(id, 'cancelled', { cancelled_at: new Date() });
    if (!cancelled) throw new Error('Ride request not found after cancelling.');
    await rideRequestsModel.cancelLinkedTrip(id);
    await notificationsService.createInAppSafely(
      request.rider_user_id,
      'Journey cancelled',
      'The parent cancelled this journey request.'
    );
    return this.toResponse(cancelled, 'parent');
  }

  async updateAvailability(riderUserId: number, input: Omit<UpsertRiderAvailabilityDTO, 'rider_id'>): Promise<RiderAvailability | null> {
    this.assertVehicleType(input.vehicle_type);
    this.assertCoordinate({ lat: input.lat, lng: input.lng }, 'location');

    const rider = await ridersModel.findByUserId(riderUserId);
    if (!rider) {
      const error = new Error('Rider profile not found for this account.');
      (error as any).statusCode = 404;
      throw error;
    }

    if (input.is_available && rider.approval_status !== 'approved') {
      const error = new Error('Only approved riders can become available for assignments.');
      (error as any).statusCode = 403;
      throw error;
    }

    return rideRequestsModel.upsertRiderAvailability({
      rider_id: rider.id,
      vehicle_type: input.vehicle_type,
      lat: input.lat,
      lng: input.lng,
      is_available: input.is_available,
    });
  }

  private async getAssignedRequestForRider(id: number, riderUserId: number): Promise<RideRequestDetails> {
    const request = await rideRequestsModel.findById(id);
    if (!request || request.rider_user_id !== riderUserId) {
      const error = new Error('Ride request not found for this rider.');
      (error as any).statusCode = 404;
      throw error;
    }

    return request;
  }

  private async assertApprovedRider(riderUserId: number): Promise<void> {
    const rider = await ridersModel.findByUserId(riderUserId);
    if (!rider || rider.approval_status !== 'approved') {
      const error = new Error('Only approved riders can manage assignments.');
      (error as any).statusCode = 403;
      throw error;
    }
  }

  private canAccess(request: RideRequestDetails, userId: number, role: string): boolean {
    if (PRIVILEGED_ROLES.has(role)) return true;
    if (role === 'parent') return request.parent_user_id === userId;
    if (role === 'rider') return request.rider_user_id === userId;
    return false;
  }

  private toResponse(request: RideRequestDetails, role: string): RideRequestResponse {
    const canSeeChildName = role === 'parent' || PRIVILEGED_ROLES.has(role);
    const childDisplayName = canSeeChildName && request.child_name
      ? request.child_name
      : `Passenger #${request.kid_id}`;

    return {
      id: request.id,
      status: request.status,
      requested_vehicle_type: request.requested_vehicle_type,
      fare_amount: Number(request.fare_amount),
      journey_type: request.journey_type,
      pickup: {
        label: request.pickup_label,
        lat: Number(request.pickup_lat),
        lng: Number(request.pickup_lng),
      },
      destination: {
        label: request.destination_label,
        lat: Number(request.destination_lat),
        lng: Number(request.destination_lng),
      },
      child: {
        id: request.kid_id,
        display_name: childDisplayName,
        ...(canSeeChildName && request.child_name ? { name: request.child_name } : {}),
        school: request.child_school,
        grade: request.child_grade,
      },
      rider: request.assigned_rider_id
        ? {
            id: request.assigned_rider_id,
            user_id: request.rider_user_id,
            name: request.rider_name,
            phone_number: request.rider_phone_number,
            vehicle_type: request.rider_vehicle_type,
            number_plate: request.rider_number_plate,
            lat: request.rider_lat === null ? null : Number(request.rider_lat),
            lng: request.rider_lng === null ? null : Number(request.rider_lng),
            last_seen_at: request.rider_last_seen_at,
          }
        : null,
      trip_id: request.trip_id,
      created_at: request.created_at,
      assigned_at: request.assigned_at,
      accepted_at: request.accepted_at,
      declined_at: request.declined_at,
      cancelled_at: request.cancelled_at,
      completed_at: request.completed_at,
    };
  }

  private assertVehicleType(value: string): asserts value is VehicleType {
    if (!VEHICLE_TYPES.has(value)) {
      const error = new Error('vehicle_type must be either boda or tuktuk.');
      (error as any).statusCode = 400;
      throw error;
    }
  }

  private assertJourneyType(value: string): asserts value is JourneyType {
    if (!JOURNEY_TYPES.has(value)) {
      const error = new Error('journey_type is not supported.');
      (error as any).statusCode = 400;
      throw error;
    }
  }

  private assertCoordinate(point: CoordinateInput, fieldName: string): void {
    if (
      !point ||
      typeof point.lat !== 'number' ||
      typeof point.lng !== 'number' ||
      !Number.isFinite(point.lat) ||
      !Number.isFinite(point.lng) ||
      point.lat < -90 ||
      point.lat > 90 ||
      point.lng < -180 ||
      point.lng > 180
    ) {
      const error = new Error(`${fieldName} must include valid lat and lng values.`);
      (error as any).statusCode = 400;
      throw error;
    }
  }
}

export const rideRequestsService = new RideRequestsService();
