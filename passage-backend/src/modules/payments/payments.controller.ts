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
      const { amount, phone, description } = req.body;

      if (!userId || !amount || !phone) {
        sendError(res, 'Missing required fields', 400);
        return;
      }

      const result = await paymentsService.initiatePayment(userId, {
        amount,
        phone,
        description,
      });

      sendSuccess(res, 'Payment initiated successfully', result, 201);
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 500);
    }
  }

  async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      const paymentId = Number(req.params.paymentId);
      if (!userId || !Number.isInteger(paymentId)) {
        sendError(res, 'Invalid payment.', 400);
        return;
      }

      const result = await paymentsService.verifyPayment(paymentId, userId);
      sendSuccess(res, 'Payment verified successfully', result);
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 500);
    }
  }
}

export const paymentsController = new PaymentsController();
