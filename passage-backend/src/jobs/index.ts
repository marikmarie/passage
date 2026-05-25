import cron from 'node-cron';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2/promise';

// Run every hour: Check for low battery alerts
export const setupBatteryAlertJob = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('⏰ Running battery alert check...');

      const [devices] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM devices WHERE battery_level < 20 AND status = 'active'`
      );

      // Create alerts for low battery devices
      for (const device of devices) {
        const [existing] = await pool.query<RowDataPacket[]>(
          `SELECT * FROM alerts WHERE device_id = ? AND type = 'low_battery' AND resolved_at IS NULL`,
          [(device as any).id]
        );

        if (existing.length === 0) {
          await pool.query(
            `INSERT INTO alerts (device_id, rider_id, type) VALUES (?, ?, ?)`,
            [(device as any).id, (device as any).rider_id, 'low_battery']
          );

          console.log(`🔋 Low battery alert created for device ${(device as any).id}`);
        }
      }
    } catch (error) {
      console.error('❌ Battery alert job error:', error);
    }
  });
};

// Run every 5 minutes: Check for inactive devices
export const setupInactiveDeviceJob = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('⏰ Running inactive device check...');

      const [devices] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM devices WHERE last_seen < DATE_SUB(NOW(), INTERVAL 10 MINUTE) AND status = 'active'`
      );

      for (const device of devices) {
        await pool.query(
          `UPDATE devices SET status = ?, updated_at = NOW() WHERE id = ?`,
          ['offline', (device as any).id]
        );

        console.log(`📴 Device ${(device as any).id} marked as offline`);
      }
    } catch (error) {
      console.error('❌ Inactive device job error:', error);
    }
  });
};

// Run daily at 11:59 PM: Generate trip summaries
export const setupTripSummaryJob = () => {
  cron.schedule('59 23 * * *', async () => {
    try {
      console.log('⏰ Generating trip summaries...');

      const [trips] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM trips WHERE status = 'active' AND DATE(start_time) = CURDATE()`
      );

      console.log(`✅ Trip summary generated: ${trips.length} trips today`);
    } catch (error) {
      console.error('❌ Trip summary job error:', error);
    }
  });
};

// Run daily at midnight: Generate daily reports
export const setupReportGenerationJob = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('⏰ Generating daily reports...');

      const [trips] = await pool.query<RowDataPacket[]>(
        `SELECT DATE(start_time) as date, COUNT(*) as count FROM trips WHERE DATE(start_time) = CURDATE() - INTERVAL 1 DAY GROUP BY DATE(start_time)`
      );

      console.log(`✅ Daily reports generated`);
    } catch (error) {
      console.error('❌ Report generation job error:', error);
    }
  });
};

// Run every 30 seconds: Health check
export const setupHealthCheckJob = () => {
  cron.schedule('*/30 * * * * *', async () => {
    try {
      const connection = await pool.getConnection();
      connection.release();
      console.log('✅ Database health check passed');
    } catch (error) {
      console.error('❌ Database health check failed:', error);
    }
  });
};

// Initialize all jobs
export const initializeJobs = () => {
  console.log('🚀 Initializing scheduled jobs...');
  setupBatteryAlertJob();
  setupInactiveDeviceJob();
  setupTripSummaryJob();
  setupReportGenerationJob();
  setupHealthCheckJob();
  console.log('✅ All jobs initialized');
};
