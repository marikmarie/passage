import { Request, Response } from 'express';
import { notificationsService } from './notifications.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class NotificationsController {
  async getByUserId(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
       const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      if (!userId) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const result = await notificationsService.getNotificationsByUserId(userId, page, limit);
      sendSuccess(res, 'Notifications retrieved successfully', result);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async send(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { user_id, title, body, channel, type, phone, email, deviceToken } = req.body;

      if (!user_id || !title || !body || !channel) {
        sendError(res, 'Missing required fields', 400);
        return;
      }

      const notification = await notificationsService.sendNotification({
        user_id,
        title,
        body,
        channel,
        type,
        phone,
        email,
        deviceToken,
      });

      sendSuccess(res, 'Notification sent successfully', notification, 201);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async markRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const id = Number(req.params.id);
      if (!userId || !Number.isInteger(id)) {
        sendError(res, 'Invalid notification.', 400);
        return;
      }
      const notification = await notificationsService.markRead(id, userId);
      if (!notification) {
        sendError(res, 'Notification not found.', 404);
        return;
      }
      sendSuccess(res, 'Notification marked as read.', notification);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async markAllRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const updated = await notificationsService.markAllRead(userId);
      sendSuccess(res, 'Notifications marked as read.', { updated });
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}

export const notificationsController = new NotificationsController();
