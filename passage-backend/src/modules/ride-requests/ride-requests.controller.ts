import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { sendError, sendPaginated, sendSuccess } from '../../utils/response.util';
import { rideRequestsService } from './ride-requests.service';

export class RideRequestsController {
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const { kid_id, vehicle_type, journey_type, pickup, destination } = req.body;
      const request = await rideRequestsService.create(user.id, {
        kid_id: Number(kid_id),
        vehicle_type,
        journey_type,
        pickup,
        destination,
      });

      sendSuccess(res, 'Ride request created successfully', request, 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create ride request', error.statusCode || 500);
    }
  }

  async getActive(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const request = await rideRequestsService.getActive(user.id, user.role);
      sendSuccess(res, request ? 'Active ride request retrieved successfully' : 'No active ride request found', request);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve active ride request', error.statusCode || 500);
    }
  }

  async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
      const result = await rideRequestsService.listForUser(user.id, user.role, page, limit);

      sendPaginated(res, 'Ride requests retrieved successfully', result.requests, {
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      });
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve ride requests', error.statusCode || 500);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const request = await rideRequestsService.getById(Number(req.params.id), user.id, user.role);
      if (!request) {
        sendError(res, 'Ride request not found', 404);
        return;
      }

      sendSuccess(res, 'Ride request retrieved successfully', request);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve ride request', error.statusCode || 500);
    }
  }

  async accept(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const request = await rideRequestsService.accept(Number(req.params.id), user.id);
      sendSuccess(res, 'Ride request accepted successfully', request);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to accept ride request', error.statusCode || 500);
    }
  }

  async decline(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const request = await rideRequestsService.decline(Number(req.params.id), user.id);
      sendSuccess(res, 'Ride request declined successfully', request);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to decline ride request', error.statusCode || 500);
    }
  }

  async cancel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const request = await rideRequestsService.cancel(Number(req.params.id), user.id);
      sendSuccess(res, 'Ride request cancelled successfully', request);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to cancel ride request', error.statusCode || 500);
    }
  }

  async updateAvailability(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const { vehicle_type, lat, lng, is_available = true } = req.body;
      const availability = await rideRequestsService.updateAvailability(user.id, {
        vehicle_type,
        lat: Number(lat),
        lng: Number(lng),
        is_available: is_available === true || is_available === 'true' || is_available === 1,
      });

      sendSuccess(res, 'Rider availability updated successfully', availability);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update rider availability', error.statusCode || 500);
    }
  }
}

export const rideRequestsController = new RideRequestsController();
