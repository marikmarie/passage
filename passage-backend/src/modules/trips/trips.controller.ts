import { Request, Response } from "express";
import { tripsService } from "./trips.service";
import { sendSuccess, sendError } from "../../utils/response.util";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";

export class TripsController {


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
        
        await tripsService.validateQRToken(tripId, verificationToken, riderId);
        
        await tripsService.updateTripState(tripId, 'PICKUP_CONFIRMED');
        
        res.status(200).json({ success: true, message: "Verification successful. Status updated to PICKUP_CONFIRMED." });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Verification failed";
        sendError(res, message, 400);
    }
}
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
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

  async getByRiderId(req: Request, res: Response): Promise<void> {
    try {
      const riderId = Number(req.params.riderId);
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

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

      const trip = await tripsService.createTrip({ rider_id, device_id });
      sendSuccess(res, "Trip created successfully", trip, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create trip";
      sendError(res, message, 500);
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

      const trip = await tripsService.endTrip(id, distance_km);

      if (!trip) {
        sendError(res, "Trip not found", 404);
        return;
      }

      sendSuccess(res, "Trip ended successfully", trip);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to end trip";
      sendError(res, message, 500);
    }
  }

  async cancelTrip(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {      
      const id = Number(req.params.id);
      const trip = await tripsService.cancelTrip(id);

      if (!trip) {
        sendError(res, "Trip not found", 404);
        return;
      }

      sendSuccess(res, "Trip cancelled successfully", trip);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to cancel trip";
      sendError(res, message, 500);
    }
  }
}

export const tripsController = new TripsController();
