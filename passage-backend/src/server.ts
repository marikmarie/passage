import http from 'http';
import { createApp } from './config/app';
import { testConnection } from './config/database';
import { env } from './config/env';
import { setupSocketIO } from './sockets/socket.server';
import { initializeJobs } from './jobs/index';

const startServer = async () => {
  try {
    // Test Database Connection
    await testConnection();

    const app = createApp();
    const server = http.createServer(app);

    // Setup Socket.IO
    setupSocketIO(server);

    // Initialize scheduled jobs
    initializeJobs();

    server.listen(env.PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   🚀 PASSAGE Backend Server Started    ║
║   Port: ${env.PORT}                             ║
║   Environment: ${process.env.NODE_ENV || 'development'}                 ║
╚════════════════════════════════════════╝
      `);
      console.log(`📍 API: http://localhost:${env.PORT}/api/v1`);
      console.log(`🎛️  Admin Dashboard: http://localhost:${env.PORT}/admin`);
      console.log(`📡 WebSocket: ws://localhost:${env.PORT}/tracking`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received: shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
