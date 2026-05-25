import { paymentsModel } from './payments.model';
import { getPaginationOptions, calculateOffset } from '../../utils/pagination.util';
import { collectoService } from '../../services/collecto.service';

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
    // Create payment record
    const payment = await paymentsModel.create({
      user_id: userId,
      amount: data.amount,
      currency: data.currency || 'UGX',
      provider: 'collecto',
      reference: `PASSAGE_${Date.now()}`,
    });

    // Call Collecto API - Request payment from phone
    const collectoResponse = await collectoService.requestToPay({
      paymentOption: 'mobilemoney',
      phone: data.phone,
      amount: data.amount,
      reference: payment.reference,
    });

    return {
      payment,
      transactionId: collectoResponse.transactionId,
      status: collectoResponse.status,
    };
  }

  async verifyPayment(transactionId: string) {
    const collectoResponse = await collectoService.requestToPayStatus({
      transactionId,
    });

    if (collectoResponse.status === 'successful') {
      // Update payment status
      const payment = await paymentsModel.findById(parseInt(transactionId));
      if (payment) {
        await paymentsModel.update(payment.id, { status: 'completed' });
      }
    }

    return collectoResponse;
  }
}

export const paymentsService = new PaymentsService();
