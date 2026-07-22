import { walletModel } from './wallet.model';
import { notificationsService } from '../notifications/notifications.service';

export class WalletService {
  getSummary(userId: number) {
    return walletModel.getSummary(userId);
  }

  async requestPayout(userId: number, data: any) {
    const amount = Number(data.amount);
    const phone = String(data.phone || '').replace(/\s+/g, '');
    const provider = String(data.provider || '').toLowerCase();
    if (!Number.isFinite(amount) || amount < 25000) {
      throw this.walletError('The minimum payout is UGX 25,000.', 400);
    }
    if (!/^\+?256\d{9}$/.test(phone)) {
      throw this.walletError('Enter a valid Ugandan mobile money number.', 400);
    }
    if (!['mtn', 'airtel'].includes(provider)) {
      throw this.walletError('Payout provider must be MTN or Airtel.', 400);
    }
    const payout = await walletModel.requestPayout(
      userId,
      amount,
      phone,
      provider as 'mtn' | 'airtel'
    );
    await notificationsService.createInAppSafely(
      userId,
      'Payout requested',
      `Your UGX ${amount.toLocaleString()} payout request is pending processing.`,
      'payout'
    );
    return payout;
  }

  private walletError(message: string, statusCode: number): Error {
    const error = new Error(message);
    (error as any).statusCode = statusCode;
    return error;
  }
}

export const walletService = new WalletService();
