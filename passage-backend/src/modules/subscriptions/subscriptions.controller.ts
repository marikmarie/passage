import { Request, Response } from 'express';
import { subscriptionsService } from './subscriptions.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class SubscriptionsController {
  async getByUserId(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const subscription = await subscriptionsService.getSubscriptionByUserId(userId);

      if (!subscription) {
        sendError(res, 'No subscription found', 404);
        return;
      }

      sendSuccess(res, 'Subscription retrieved successfully', subscription);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt((req.query.page as string) || '1') || 1;
      const limit = parseInt((req.query.limit as string) || '10') || 10;
      const result = await subscriptionsService.getAllSubscriptions(page, limit);
      sendSuccess(res, 'Subscriptions retrieved successfully', result);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { plan, payment_id } = req.body;

      if (!userId || !plan) {
        sendError(res, 'Missing required fields', 400);
        return;
      }

      const subscription = await subscriptionsService.createSubscription(userId, {
        plan,
        payment_id,
      });

      sendSuccess(res, 'Subscription created successfully', subscription, 201);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async upgrade(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id || '');
      const { plan } = req.body;

      if (!plan) {
        sendError(res, 'Plan is required', 400);
        return;
      }

      const subscription = await subscriptionsService.upgradeSubscription(parseInt(id), plan);

      if (!subscription) {
        sendError(res, 'Subscription not found', 404);
        return;
      }

      sendSuccess(res, 'Subscription upgraded successfully', subscription);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async renew(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id || '');

      const subscription = await subscriptionsService.renewSubscription(parseInt(id));

      if (!subscription) {
        sendError(res, 'Subscription not found', 404);
        return;
      }

      sendSuccess(res, 'Subscription renewed successfully', subscription);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}

export const subscriptionsController = new SubscriptionsController();
