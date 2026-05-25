import { Request, Response } from 'express';
import { paymentsService } from './payments.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class PaymentsController {
  async getByUserId(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      if (!userId) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const result = await paymentsService.getPaymentsByUserId(userId, page, limit);
      sendSuccess(res, 'Payments retrieved successfully', result);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async initiatePayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { amount, currency, email, description, callback_url } = req.body;

      if (!userId || !amount || !email) {
        sendError(res, 'Missing required fields', 400);
        return;
      }

      const result = await paymentsService.initiatePayment(userId, {
        amount,
        currency,
        email,
        description,
        callback_url,
      });

      sendSuccess(res, 'Payment initiated successfully', result, 201);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const transactionId = Array.isArray(req.params.transactionId) ? req.params.transactionId[0] : (req.params.transactionId || '');

      const result = await paymentsService.verifyPayment(transactionId);
      sendSuccess(res, 'Payment verified successfully', result);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}

export const paymentsController = new PaymentsController();
