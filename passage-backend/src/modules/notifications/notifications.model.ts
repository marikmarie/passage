import { pool } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  body: string;
  channel: 'in_app' | 'push' | 'sms' | 'email';
  type: string;
  read_at: Date | null;
  sent_at: Date | null;
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

  async findByUserId(userId: number, limit: number = 10, offset: number = 0): Promise<{ notifications: Notification[]; total: number; unread: number }> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, limit, offset]
    );

    const [countResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total, SUM(read_at IS NULL) as unread FROM notifications WHERE user_id = ?',
      [userId]
    );

    return {
      notifications: rows as Notification[],
      total: (countResult[0] as any).total,
      unread: Number((countResult[0] as any).unread || 0),
    };
  }

  async create(data: any): Promise<Notification> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO notifications (user_id, title, body, channel, type, sent_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [data.user_id, data.title, data.body, data.channel || 'in_app', data.type || 'general']
    );

    const notification = await this.findById(result.insertId);
    if (!notification) throw new Error('Failed to create notification');
    return notification;
  }

  async markRead(id: number, userId: number): Promise<Notification | null> {
    await pool.query(
      'UPDATE notifications SET read_at = COALESCE(read_at, NOW()) WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    const notification = await this.findById(id);
    return notification?.user_id === userId ? notification : null;
  }

  async markAllRead(userId: number): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL',
      [userId]
    );
    return result.affectedRows;
  }
}

export const notificationsModel = new NotificationsModel();
