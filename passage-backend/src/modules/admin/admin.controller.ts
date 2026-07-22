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
  async getRiderReviews(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, status = 'pending_review' } = req.query;
      const pageNumber = Math.max(parseInt(String(page), 10) || 1, 1);
      const limitNumber = Math.min(Math.max(parseInt(String(limit), 10) || 10, 1), 100);
      const offset = (pageNumber - 1) * limitNumber;
      const statuses = ['draft', 'pending_review', 'approved', 'rejected', 'suspended'];
      const statusValue = String(status);

      let whereClause = 'WHERE 1=1';
      const params: any[] = [];

      if (statusValue !== 'all') {
        if (!statuses.includes(statusValue)) {
          sendError(res, 'Invalid rider approval status filter', 400);
          return;
        }
        whereClause += ' AND r.approval_status = ?';
        params.push(statusValue);
      }

      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT r.*, u.email, u.phone_number, u.role, reviewer.email AS reviewed_by_email
         FROM riders r
         LEFT JOIN users u ON u.id = r.user_id
         LEFT JOIN users reviewer ON reviewer.id = r.reviewed_by
         ${whereClause}
         ORDER BY COALESCE(r.submitted_at, r.updated_at) DESC
         LIMIT ? OFFSET ?`,
        [...params, limitNumber, offset]
      );

      const [countRows] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total
         FROM riders r
         ${whereClause}`,
        params
      );

      sendSuccess(res, 'Rider review profiles retrieved', {
        riders: rows,
        pagination: {
          total: (countRows[0] as any).total,
          page: pageNumber,
          limit: limitNumber,
          pages: Math.ceil((countRows[0] as any).total / limitNumber),
        },
      });
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async getRiderReviewById(req: Request, res: Response): Promise<void> {
    try {
      const riderId = parseInt(String(req.params.riderId), 10);
      if (!riderId) {
        sendError(res, 'Invalid rider ID', 400);
        return;
      }

      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT r.*, u.email, u.phone_number, u.role, reviewer.email AS reviewed_by_email
         FROM riders r
         LEFT JOIN users u ON u.id = r.user_id
         LEFT JOIN users reviewer ON reviewer.id = r.reviewed_by
         WHERE r.id = ?
         LIMIT 1`,
        [riderId]
      );

      if (rows.length === 0) {
        sendError(res, 'Rider profile not found', 404);
        return;
      }

      sendSuccess(res, 'Rider review profile retrieved', rows[0]);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async updateRiderReviewStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const riderId = parseInt(String(req.params.riderId), 10);
      const approvalStatus = req.body.approval_status ?? req.body.approvalStatus;
      const reviewNote = req.body.review_note ?? req.body.reviewNote ?? null;
      const allowedStatuses = ['pending_review', 'approved', 'rejected', 'suspended'];

      if (!riderId) {
        sendError(res, 'Invalid rider ID', 400);
        return;
      }

      if (!allowedStatuses.includes(approvalStatus)) {
        sendError(res, 'approval_status must be pending_review, approved, rejected, or suspended', 400);
        return;
      }

      if ((approvalStatus === 'rejected' || approvalStatus === 'suspended') && !String(reviewNote ?? '').trim()) {
        sendError(res, 'review_note is required when rejecting or suspending a rider', 400);
        return;
      }

      const [result] = await pool.query<ResultSetHeader>(
        `UPDATE riders
         SET approval_status = ?, reviewed_by = ?, reviewed_at = NOW(), review_note = ?, updated_at = NOW()
         WHERE id = ?`,
        [approvalStatus, req.user?.id ?? null, reviewNote, riderId]
      );

      if (result.affectedRows === 0) {
        sendError(res, 'Rider profile not found', 404);
        return;
      }

      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM riders WHERE id = ? LIMIT 1',
        [riderId]
      );

      sendSuccess(res, 'Rider review status updated', rows[0]);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}

export const adminController = new AdminController();
