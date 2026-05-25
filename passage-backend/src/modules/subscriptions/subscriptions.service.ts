import { subscriptionsModel } from './subscriptions.model';
import { getPaginationOptions, calculateOffset } from '../../utils/pagination.util';

export class SubscriptionsService {
  async getSubscriptionByUserId(userId: number) {
    return subscriptionsModel.findByUserId(userId);
  }

  async getAllSubscriptions(page?: string | number, limit?: string | number) {
    const { page: p, limit: l } = getPaginationOptions(page, limit);
    const offset = calculateOffset(p, l);

    const { subscriptions, total } = await subscriptionsModel.findAll(l, offset);

    return {
      subscriptions,
      pagination: {
        total,
        page: p,
        limit: l,
        pages: Math.ceil(total / l),
      },
    };
  }

  async createSubscription(userId: number, data: any) {
    return subscriptionsModel.create({
      user_id: userId,
      plan: data.plan,
      payment_id: data.payment_id,
    });
  }

  async upgradeSubscription(id: number, plan: string) {
    return subscriptionsModel.update(id, { plan });
  }

  async renewSubscription(id: number) {
    return subscriptionsModel.update(id, {
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
  }
}

export const subscriptionsService = new SubscriptionsService();
