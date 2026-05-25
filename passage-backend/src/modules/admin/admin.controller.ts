import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { pool } from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class AdminController {
  async getSystemStats(req: Request, res: Response): Promise<void> {
    try {
      // Get all stats
      const [usersCount] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM users`
      );

      const [ridersCount] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM riders`
      );

      const [devicesCount] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM devices`
      );

      const [tripsCount] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM trips`
      );

      const stats = {
        total_users: (usersCount[0] as any).count,
        total_riders: (ridersCount[0] as any).count,
        total_devices: (devicesCount[0] as any).count,
        total_trips: (tripsCount[0] as any).count,
      };

      sendSuccess(res, 'System stats retrieved', stats);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, role } = req.query;

      let query = 'SELECT * FROM users';
      const params: any[] = [];

      if (role) {
        query += ' WHERE role = ?';
        params.push(role);
      }

      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(String(limit)), (parseInt(String(page)) - 1) * parseInt(String(limit)));

      const [rows] = await pool.query<RowDataPacket[]>(query, params);

      sendSuccess(res, 'Users retrieved', rows);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async updateUserStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { status } = req.body;

      if (!status) {
        sendError(res, 'Status is required', 400);
        return;
      }

      const [result] = await pool.query<ResultSetHeader>(
        'UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, userId]
      );

      if (result.affectedRows === 0) {
        sendError(res, 'User not found', 404);
        return;
      }

      sendSuccess(res, 'User status updated', { id: userId, status });
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async getAllDevices(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, status } = req.query;

      let query = 'SELECT * FROM devices';
      const params: any[] = [];

      if (status) {
        query += ' WHERE status = ?';
        params.push(status);
      }

      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(String(limit)), (parseInt(String(page)) - 1) * parseInt(String(limit)));

      const [rows] = await pool.query<RowDataPacket[]>(query, params);

      sendSuccess(res, 'Devices retrieved', rows);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async getAllAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, type, resolved } = req.query;

      let query = 'SELECT * FROM alerts WHERE 1=1';
      const params: any[] = [];

      if (type) {
        query += ' AND type = ?';
        params.push(type);
      }

      if (resolved !== undefined) {
        if (resolved === 'true') {
          query += ' AND resolved_at IS NOT NULL';
        } else {
          query += ' AND resolved_at IS NULL';
        }
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(String(limit)), (parseInt(String(page)) - 1) * parseInt(String(limit)));

      const [rows] = await pool.query<RowDataPacket[]>(query, params);

      sendSuccess(res, 'Alerts retrieved', rows);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async getAllPayments(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, status } = req.query;

      let query = 'SELECT * FROM payments';
      const params: any[] = [];

      if (status) {
        query += ' WHERE status = ?';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(String(limit)), (parseInt(String(page)) - 1) * parseInt(String(limit)));

      const [rows] = await pool.query<RowDataPacket[]>(query, params);

      sendSuccess(res, 'Payments retrieved', rows);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}

export const adminController = new AdminController();
