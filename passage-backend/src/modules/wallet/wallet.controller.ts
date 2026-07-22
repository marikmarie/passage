import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { sendError, sendSuccess } from '../../utils/response.util';
import { walletService } from './wallet.service';

export class WalletController {
  async getSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      sendSuccess(res, 'Wallet retrieved successfully.', await walletService.getSummary(req.user.id));
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 500);
    }
  }

  async requestPayout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const payout = await walletService.requestPayout(req.user.id, req.body);
      sendSuccess(res, 'Payout request created.', payout, 201);
    } catch (error: any) {
      sendError(res, error.message, error.statusCode || 500);
    }
  }
}

export const walletController = new WalletController();
