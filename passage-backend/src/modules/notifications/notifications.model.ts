import { pool } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  body: string;
  channel: 'push' | 'sms' | 'email';
  sent_at: Date;
  created_at: Date;
}

export class NotificationsModel {
  async findById(id: number): Promise<Notification | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM notifications WHERE id = ?',
      [id]
    );
    return rows.length ? (rows[0] as Notification) : null;
  }

  async findByUserId(userId: number, limit: number = 10, offset: number = 0): Promise<{ notifications: Notification[]; total: number }> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, limit, offset]
    );

    const [countResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?',
      [userId]
    );

    return {
      notifications: rows as Notification[],
      total: (countResult[0] as any).total,
    };
  }

  async create(data: any): Promise<Notification> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO notifications (user_id, title, body, channel, sent_at) VALUES (?, ?, ?, ?, NOW())',
      [data.user_id, data.title, data.body, data.channel]
    );

    const notification = await this.findById(result.insertId);
    if (!notification) throw new Error('Failed to create notification');
    return notification;
  }
}

export const notificationsModel = new NotificationsModel();
