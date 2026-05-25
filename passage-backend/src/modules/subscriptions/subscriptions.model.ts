import { pool } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface Subscription {
  id: number;
  user_id: number;
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  start_date: Date;
  end_date: Date;
  payment_id?: number;
  created_at: Date;
  updated_at: Date;
}

export class SubscriptionsModel {
  async findById(id: number): Promise<Subscription | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM subscriptions WHERE id = ?',
      [id]
    );
    return rows.length ? (rows[0] as Subscription) : null;
  }

  async findByUserId(userId: number): Promise<Subscription | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY end_date DESC LIMIT 1',
      [userId]
    );
    return rows.length ? (rows[0] as Subscription) : null;
  }

  async findAll(limit: number = 10, offset: number = 0): Promise<{ subscriptions: Subscription[]; total: number }> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const [countResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM subscriptions'
    );

    return {
      subscriptions: rows as Subscription[],
      total: (countResult[0] as any).total,
    };
  }

  async create(data: any): Promise<Subscription> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO subscriptions (user_id, plan, start_date, end_date, payment_id) VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), ?)',
      [data.user_id, data.plan, data.payment_id || null]
    );

    const subscription = await this.findById(result.insertId);
    if (!subscription) throw new Error('Failed to create subscription');
    return subscription;
  }

  async update(id: number, updates: any): Promise<Subscription | null> {
    const keys = Object.keys(updates);
    const values = Object.values(updates);

    if (keys.length === 0) return this.findById(id);

    const updateClause = keys.map(k => `${k} = ?`).join(', ');
    await pool.query(
      `UPDATE subscriptions SET ${updateClause}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );

    return this.findById(id);
  }
}

export const subscriptionsModel = new SubscriptionsModel();
