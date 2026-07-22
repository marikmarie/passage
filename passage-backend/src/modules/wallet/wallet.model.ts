import { pool } from '../../config/database';
import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { Payment } from '../payments/payments.model';

export class WalletModel {
  async assertAvailableBalance(userId: number, requiredAmount: number): Promise<void> {
    await pool.query(
      `INSERT INTO wallets (user_id, currency, balance)
       VALUES (?, 'UGX', 0)
       ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)`,
      [userId]
    );
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT balance FROM wallets WHERE user_id = ?',
      [userId]
    );
    if (Number(rows[0].balance || 0) < requiredAmount) {
      const error = new Error(
        `Wallet balance is too low. Top up at least UGX ${requiredAmount.toLocaleString()} to request this ride.`
      );
      (error as any).statusCode = 409;
      throw error;
    }
  }

  async getSummary(userId: number) {
    await pool.query(
      `INSERT INTO wallets (user_id, currency, balance)
       VALUES (?, 'UGX', 0)
       ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)`,
      [userId]
    );
    const [walletRows] = await pool.query<RowDataPacket[]>(
      `SELECT w.*,
         COALESCE((SELECT SUM(pr.amount) FROM payout_requests pr
                   WHERE pr.rider_user_id = w.user_id
                     AND pr.status IN ('pending', 'processing')), 0) AS reserved_payout
       FROM wallets w WHERE w.user_id = ?`,
      [userId]
    );
    const wallet = walletRows[0] as any;
    const [transactionRows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM wallet_transactions
       WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
      [userId]
    );
    const [payoutRows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM payout_requests
       WHERE rider_user_id = ? ORDER BY created_at DESC LIMIT 20`,
      [userId]
    );
    return {
      balance: Number(wallet.balance || 0),
      available_balance: Math.max(0, Number(wallet.balance || 0) - Number(wallet.reserved_payout || 0)),
      currency: wallet.currency,
      transactions: transactionRows,
      payouts: payoutRows,
    };
  }

  async creditCompletedTopUp(payment: Payment): Promise<void> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(
        `INSERT INTO wallets (user_id, currency, balance)
         VALUES (?, ?, 0)
         ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)`,
        [payment.user_id, payment.currency]
      );
      const [walletRows] = await connection.query<RowDataPacket[]>(
        'SELECT id FROM wallets WHERE user_id = ? FOR UPDATE',
        [payment.user_id]
      );
      const walletId = Number(walletRows[0].id);
      const [insert] = await connection.query<ResultSetHeader>(
        `INSERT IGNORE INTO wallet_transactions
         (wallet_id, user_id, payment_id, direction, type, amount, status, reference, description)
         VALUES (?, ?, ?, 'credit', 'topup', ?, 'completed', ?, ?)`,
        [walletId, payment.user_id, payment.id, payment.amount, `payment:${payment.id}`, payment.description]
      );
      if (insert.affectedRows === 1) {
        await connection.query(
          'UPDATE wallets SET balance = balance + ? WHERE id = ?',
          [payment.amount, walletId]
        );
      }
      await connection.query(
        `UPDATE payments
         SET status = 'completed', completed_at = COALESCE(completed_at, NOW())
         WHERE id = ?`,
        [payment.id]
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async requestPayout(userId: number, amount: number, phone: string, provider: 'mtn' | 'airtel') {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(
        `INSERT INTO wallets (user_id, currency, balance)
         VALUES (?, 'UGX', 0)
         ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)`,
        [userId]
      );
      const [walletRows] = await connection.query<RowDataPacket[]>(
        'SELECT id, balance FROM wallets WHERE user_id = ? FOR UPDATE',
        [userId]
      );
      const wallet = walletRows[0] as any;
      const [reservedRows] = await connection.query<RowDataPacket[]>(
        `SELECT COALESCE(SUM(amount), 0) AS reserved FROM payout_requests
         WHERE rider_user_id = ? AND status IN ('pending', 'processing')`,
        [userId]
      );
      const available = Number(wallet.balance) - Number((reservedRows[0] as any).reserved || 0);
      if (amount > available) {
        const error = new Error('Payout amount exceeds the available wallet balance.');
        (error as any).statusCode = 409;
        throw error;
      }
      const reference = `PAYOUT_${userId}_${Date.now()}`;
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO payout_requests
         (rider_user_id, amount, phone, provider, reference)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, amount, phone, provider, reference]
      );
      await connection.query(
        `INSERT INTO wallet_transactions
         (wallet_id, user_id, direction, type, amount, status, reference, description)
         VALUES (?, ?, 'debit', 'payout', ?, 'pending', ?, 'Rider payout request')`,
        [wallet.id, userId, amount, `payout:${result.insertId}`]
      );
      await connection.commit();
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM payout_requests WHERE id = ?',
        [result.insertId]
      );
      return rows[0];
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async settleTripFare(
    connection: PoolConnection,
    parentUserId: number,
    riderUserId: number,
    tripId: number,
    amount: number
  ): Promise<void> {
    for (const userId of [parentUserId, riderUserId].sort((a, b) => a - b)) {
      await connection.query(
        `INSERT INTO wallets (user_id, currency, balance)
         VALUES (?, 'UGX', 0)
         ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)`,
        [userId]
      );
    }
    const [walletRows] = await connection.query<RowDataPacket[]>(
      `SELECT id, user_id, balance FROM wallets
       WHERE user_id IN (?, ?) ORDER BY user_id FOR UPDATE`,
      [parentUserId, riderUserId]
    );
    const parentWallet = walletRows.find(
      (row: any) => Number(row.user_id) === parentUserId
    ) as any;
    const riderWallet = walletRows.find(
      (row: any) => Number(row.user_id) === riderUserId
    ) as any;
    const [existingRows] = await connection.query<RowDataPacket[]>(
      'SELECT id FROM wallet_transactions WHERE reference = ? LIMIT 1',
      [`trip:${tripId}:parent`]
    );
    if (existingRows.length) return;
    if (Number(parentWallet.balance) < amount) {
      const error = new Error('Parent wallet balance is insufficient to settle this trip.');
      (error as any).statusCode = 409;
      throw error;
    }
    await connection.query('UPDATE wallets SET balance = balance - ? WHERE id = ?', [
      amount,
      parentWallet.id,
    ]);
    await connection.query('UPDATE wallets SET balance = balance + ? WHERE id = ?', [
      amount,
      riderWallet.id,
    ]);
    await connection.query(
      `INSERT INTO wallet_transactions
       (wallet_id, user_id, direction, type, amount, status, reference, description)
       VALUES
       (?, ?, 'debit', 'fare', ?, 'completed', ?, 'Completed school journey fare'),
       (?, ?, 'credit', 'earning', ?, 'completed', ?, 'Completed school journey earning')`,
      [
        parentWallet.id,
        parentUserId,
        amount,
        `trip:${tripId}:parent`,
        riderWallet.id,
        riderUserId,
        amount,
        `trip:${tripId}:rider`,
      ]
    );
  }
}

export const walletModel = new WalletModel();
