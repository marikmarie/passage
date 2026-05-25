import { notificationsModel } from './notifications.model';
import { getPaginationOptions, calculateOffset } from '../../utils/pagination.util';
import { collectoService } from '../../services/collecto.service';
import { pushService } from '../../services/push.service';
import { mailerService } from '../../services/mailer.service';

export class NotificationsService {
  async getNotificationsByUserId(userId: number, page?: string | number, limit?: string | number) {
    const { page: p, limit: l } = getPaginationOptions(page, limit);
    const offset = calculateOffset(p, l);

    const { notifications, total } = await notificationsModel.findByUserId(userId, l, offset);

    return {
      notifications,
      pagination: {
        total,
        page: p,
        limit: l,
        pages: Math.ceil(total / l),
      },
    };
  }

  async sendNotification(data: any) {
    // Send via appropriate channel
    if (data.channel === 'sms' && data.phone) {
    
      await collectoService.sendSingleSMS(
        {
          phone: data.phone,
          message: data.body,
          reference: `notif_${Date.now()}`,
        }
      );
    } else if (data.channel === 'push' && data.deviceToken) {
      await pushService.sendPush({
        deviceToken: data.deviceToken,
        title: data.title,
        body: data.body,
      });
    } else if (data.channel === 'email' && data.email) {
      await mailerService.sendEmail({
        to: data.email,
        subject: data.title,
        htmlBody: data.body,
      });
    }

    // Log notification
    return notificationsModel.create({
      user_id: data.user_id,
      title: data.title,
      body: data.body,
      channel: data.channel,
    });
  }
}

export const notificationsService = new NotificationsService();
