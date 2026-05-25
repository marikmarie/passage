import { pool } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface Payment {
  id: number;
  user_id: number;
  amount: number;
  currency: string;
  provider: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  reference: string;
  created_at: Date;
  updated_at: Date;
}

export class PaymentsModel {
  async findById(id: number): Promise<Payment | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM payments WHERE id = ?',
      [id]
    );
    return rows.length ? (rows[0] as Payment) : null;
  }

  async findByUserId(userId: number, limit: number = 10, offset: number = 0): Promise<{ payments: Payment[]; total: number }> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, limit, offset]
    );

    const [countResult] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM payments WHERE user_id = ?',
      [userId]
    );

    return {
      payments: rows as Payment[],
      total: (countResult[0] as any).total,
    };
  }

  async create(data: any): Promise<Payment> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO payments (user_id, amount, currency, provider, status, reference) VALUES (?, ?, ?, ?, ?, ?)',
      [data.user_id, data.amount, data.currency, data.provider, 'pending', data.reference]
    );

    const payment = await this.findById(result.insertId);
    if (!payment) throw new Error('Failed to create payment');
    return payment;
  }

  async update(id: number, updates: any): Promise<Payment | null> {
    const keys = Object.keys(updates);
    const values = Object.values(updates);

    if (keys.length === 0) return this.findById(id);

    const updateClause = keys.map(k => `${k} = ?`).join(', ');
    await pool.query(
      `UPDATE payments SET ${updateClause}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );

    return this.findById(id);
  }
}

export const paymentsModel = new PaymentsModel();
