import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { pool } from '../../config/database';
import { RowDataPacket } from 'mysql2/promise';

export class ReportsController {
  async getDailyTripsReport(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        sendError(res, 'startDate and endDate are required', 400);
        return;
      }

      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT DATE(start_time) as date, COUNT(*) as trip_count, SUM(distance_km) as total_distance
         FROM trips
         WHERE start_time BETWEEN ? AND ?
         GROUP BY DATE(start_time)
         ORDER BY date DESC`,
        [startDate, endDate]
      );

      sendSuccess(res, 'Daily trips report retrieved', rows);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async getSOSFrequencyReport(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        sendError(res, 'startDate and endDate are required', 400);
        return;
      }

      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT type, COUNT(*) as count
         FROM alerts
         WHERE created_at BETWEEN ? AND ?
         GROUP BY type
         ORDER BY count DESC`,
        [startDate, endDate]
      );

      sendSuccess(res, 'SOS frequency report retrieved', rows);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async getRevenueReport(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        sendError(res, 'startDate and endDate are required', 400);
        return;
      }

      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT DATE(created_at) as date, status, SUM(amount) as total_amount, COUNT(*) as transaction_count
         FROM payments
         WHERE created_at BETWEEN ? AND ?
         GROUP BY DATE(created_at), status
         ORDER BY date DESC`,
        [startDate, endDate]
      );

      sendSuccess(res, 'Revenue report retrieved', rows);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      // Get active riders
      const [ridersCount] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM riders`
      );

      // Get active devices
      const [devicesCount] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM devices WHERE status = 'active'`
      );

      // Get today's SOS alerts
      const [sosCount] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM alerts WHERE type = 'SOS' AND DATE(created_at) = CURDATE()`
      );

      // Get today's revenue
      const [revenueData] = await pool.query<RowDataPacket[]>(
        `SELECT SUM(amount) as total FROM payments WHERE status = 'completed' AND DATE(created_at) = CURDATE()`
      );

      const analytics = {
        active_riders: (ridersCount[0] as any).count,
        active_devices: (devicesCount[0] as any).count,
        sos_alerts_today: (sosCount[0] as any).count,
        revenue_today: (revenueData[0] as any).total || 0,
      };

      sendSuccess(res, 'Analytics retrieved', analytics);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}

export const reportsController = new ReportsController();
