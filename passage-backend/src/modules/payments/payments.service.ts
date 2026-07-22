import { paymentsModel } from './payments.model';
import { getPaginationOptions, calculateOffset } from '../../utils/pagination.util';
import { collectoService } from '../../services/collecto.service';
import { walletModel } from '../wallet/wallet.model';
import { notificationsService } from '../notifications/notifications.service';

export class PaymentsService {
  async getPaymentsByUserId(userId: number, page?: string | number, limit?: string | number) {
    const { page: p, limit: l } = getPaginationOptions(page, limit);
    const offset = calculateOffset(p, l);

    const { payments, total } = await paymentsModel.findByUserId(userId, l, offset);

    return {
      payments,
      pagination: {
        total,
        page: p,
        limit: l,
        pages: Math.ceil(total / l),
      },
    };
  }

  async initiatePayment(userId: number, data: any) {
    const amount = Number(data.amount);
    const phone = String(data.phone || '').replace(/\s+/g, '');
    if (!Number.isFinite(amount) || amount < 1000 || amount > 5000000) {
      throw this.paymentError('Amount must be between UGX 1,000 and UGX 5,000,000.', 400);
    }
    if (!/^\+?256\d{9}$/.test(phone)) {
      throw this.paymentError('Enter a valid Ugandan mobile money number.', 400);
    }

    const payment = await paymentsModel.create({
      user_id: userId,
      amount,
      currency: 'UGX',
      provider: 'collecto',
      reference: `PASSAGE_${userId}_${Date.now()}`,
      phone,
      description: data.description || 'PASSAGE wallet top-up',
    });

    try {
      const collectoResponse = await collectoService.requestToPay({
        paymentOption: 'mobilemoney',
        phone,
        amount,
        reference: payment.reference,
      });
      const mappedStatus = this.mapProviderStatus(collectoResponse.status);
      let updated = await paymentsModel.update(payment.id, {
        provider_ref: collectoResponse.transactionId,
        status: mappedStatus === 'completed' ? 'pending' : mappedStatus,
      });
      if (mappedStatus === 'completed' && updated) {
        await walletModel.creditCompletedTopUp(updated);
        updated = await paymentsModel.findOwnedById(payment.id, userId);
      }

      return { payment: updated, status: collectoResponse.status };
    } catch (error) {
      await paymentsModel.update(payment.id, { status: 'failed' });
      throw error;
    }
  }

  async verifyPayment(paymentId: number, userId: number) {
    const payment = await paymentsModel.findOwnedById(paymentId, userId);
    if (!payment) throw this.paymentError('Payment not found.', 404);
    if (payment.status === 'completed' || payment.status === 'refunded') return payment;
    if (!payment.provider_ref) throw this.paymentError('Payment has no gateway reference.', 409);

    const collectoResponse = await collectoService.requestToPayStatus({
      transactionId: payment.provider_ref,
    });

    const status = this.mapProviderStatus(collectoResponse.status);
    if (status === 'completed') {
      await walletModel.creditCompletedTopUp(payment);
      await notificationsService.createInAppSafely(
        userId,
        'Wallet top-up completed',
        `UGX ${Number(payment.amount).toLocaleString()} was added to your PASSAGE wallet.`,
        'payment'
      );
    } else {
      await paymentsModel.update(payment.id, { status });
    }

    return paymentsModel.findOwnedById(payment.id, userId);
  }

  private mapProviderStatus(status: string): 'pending' | 'completed' | 'failed' {
    const normalized = status.toLowerCase();
    if (['successful', 'success', 'completed'].includes(normalized)) return 'completed';
    if (['failed', 'declined', 'cancelled', 'canceled'].includes(normalized)) return 'failed';
    return 'pending';
  }

  private paymentError(message: string, statusCode: number): Error {
    const error = new Error(message);
    (error as any).statusCode = statusCode;
    return error;
  }
}

export const paymentsService = new PaymentsService();
