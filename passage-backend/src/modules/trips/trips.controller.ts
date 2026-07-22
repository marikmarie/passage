import { Request, Response } from "express";
import { tripsService } from "./trips.service";
import { sendSuccess, sendError } from "../../utils/response.util";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";

const PRIVILEGED_ROLES = ['admin', 'support'];

export class TripsController {
  private isPrivileged(req: AuthenticatedRequest): boolean {
    return Boolean(req.user && PRIVILEGED_ROLES.includes(req.user.role));
  }

  private async canAccessTrip(req: AuthenticatedRequest, tripId: number): Promise<boolean> {
    const user = req.user;
    if (!user) return false;
    if (this.isPrivileged(req)) return true;

    const access = await tripsService.getTripAccessDetails(tripId);
    if (!access) return false;

    if (user.role === 'rider') {
      return access.rider_user_id === user.id;
    }

    if (user.role === 'parent') {
      return access.parent_user_id === user.id;
    }

    return false;
  }

  private async canAccessRiderTrips(req: AuthenticatedRequest, riderId: number): Promise<boolean> {
    const user = req.user;
    if (!user) return false;
    if (this.isPrivileged(req)) return true;
    if (user.role !== 'rider') return false;

    const ownerUserId = await tripsService.getRiderOwnerUserId(riderId);
    return ownerUserId === user.id;
  }

  async verifyTrip(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { tripId, verificationToken } = req.body;
      const riderId = req.user?.id;

      if (!riderId) {
        sendError(res, "Unauthorized", 401);
        return;
      }

      if (!tripId || !verificationToken) {
        sendError(res, "tripId and verificationToken are required", 400);
        return;
      }

      const numericTripId = Number(tripId);
      await tripsService.assertWatchAction(numericTripId, 'PICKUP');
      await tripsService.validateQRToken(numericTripId, verificationToken, riderId);
      await tripsService.updateTripState(numericTripId, 'PICKUP_CONFIRMED');

      res.status(200).json({ success: true, message: "Verification successful. Status updated to PICKUP_CONFIRMED." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Verification failed";
      sendError(res, message, 400);
    }
  }


  async verifyWatch(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { tripId, verificationToken, action = 'PICKUP' } = req.body;
      const riderId = req.user?.id;
      const normalizedAction = String(action).toUpperCase();

      if (!riderId) {
        sendError(res, "Unauthorized", 401);
        return;
      }

      if (!tripId || !verificationToken) {
        sendError(res, "tripId and verificationToken are required", 400);
        return;
      }

      if (!['PICKUP', 'DROPOFF'].includes(normalizedAction)) {
        sendError(res, "action must be PICKUP or DROPOFF", 400);
        return;
      }

      await tripsService.assertWatchAction(
        Number(tripId),
        normalizedAction as 'PICKUP' | 'DROPOFF'
      );
      await tripsService.validateQRToken(Number(tripId), verificationToken, riderId);

      const nextState = normalizedAction === 'DROPOFF' ? 'DROPOFF_CONFIRMED' : 'PICKUP_CONFIRMED';
      await tripsService.updateTripState(Number(tripId), nextState);

      res.status(200).json({
        success: true,
        message: "Watch verification successful.",
        data: {
          tripId: Number(tripId),
          action: normalizedAction,
          state: nextState,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Watch verification failed";
      sendError(res, message, 400);
    }
  }

  async getActiveTrip(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        sendError(res, "Unauthorized", 401);
        return;
      }

      const activeTrip = await tripsService.getActiveTripForUser(user.id, user.role);

      if (!activeTrip) {
        sendSuccess(res, "No active trip found", null);
        return;
      }

      sendSuccess(res, "Active trip retrieved successfully", activeTrip);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to retrieve active trip";
      sendError(res, message, 500);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      if (!(await this.canAccessTrip(req, id))) {
        sendError(res, "You do not have permission to access this trip", 403);
        return;
      }

      const trip = await tripsService.getTripById(id);

      if (!trip) {
        sendError(res, "Trip not found", 404);
        return;
      }

      sendSuccess(res, "Trip retrieved successfully", trip);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to retrieve trip";
      sendError(res, message, 500);
    }
  }

  async getByRiderId(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const riderId = Number(req.params.riderId);
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      if (!(await this.canAccessRiderTrips(req, riderId))) {
        sendError(res, "You do not have permission to access this rider's trips", 403);
        return;
      }

      const result = await tripsService.getTripsByRiderId(
        riderId,
        parseInt(String(page)),
        parseInt(String(limit)),
      );
      sendSuccess(res, "Trips retrieved successfully", result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to retrieve trips";
      sendError(res, message, 500);
    }
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { rider_id, device_id } = req.body;

      if (!rider_id || !device_id) {
        sendError(res, "Missing required fields", 400);
        return;
      }

      if (!(await this.canAccessRiderTrips(req, Number(rider_id)))) {
        sendError(res, "You do not have permission to create trips for this rider", 403);
        return;
      }

      const trip = await tripsService.createTrip({ rider_id, device_id });
      sendSuccess(res, "Trip created successfully", trip, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create trip";
      sendError(res, message, 500);
    }
  }

  async startTrip(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const riderUserId = req.user?.id;

      if (!riderUserId) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const trip = await tripsService.startTrip(id, riderUserId);
      sendSuccess(res, 'Trip started successfully', trip);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to start trip', error.statusCode || 500);
    }
  }

  async endTrip(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const { distance_km } = req.body;

      if (distance_km === undefined) {
        sendError(res, "distance_km is required", 400);
        return;
      }

      if (!(await this.canAccessTrip(req, id))) {
        sendError(res, "You do not have permission to end this trip", 403);
        return;
      }

      const numericDistance = Number(distance_km);
      if (!Number.isFinite(numericDistance) || numericDistance < 0) {
        sendError(res, 'distance_km must be a non-negative number', 400);
        return;
      }

      const trip = await tripsService.endTrip(
        id,
        numericDistance,
        req.user?.role === 'rider'
      );

      if (!trip) {
        sendError(res, "Trip not found", 404);
        return;
      }

      sendSuccess(res, "Trip ended successfully", trip);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to end trip', error.statusCode || 500);
    }
  }

  async cancelTrip(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      if (!(await this.canAccessTrip(req, id))) {
        sendError(res, "You do not have permission to cancel this trip", 403);
        return;
      }

      const trip = await tripsService.cancelTrip(id);

      if (!trip) {
        sendError(res, "Trip not found", 404);
        return;
      }

      sendSuccess(res, "Trip cancelled successfully", trip);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to cancel trip', error.statusCode || 500);
    }
  }
}

export const tripsController = new TripsController();
