import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

export const setupSocketIO = (httpServer: HTTPServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Namespace for tracking
  const trackingNamespace = io.of('/tracking');

  trackingNamespace.on('connection', (socket: Socket) => {
    console.log(`✅ Device connected to tracking: ${socket.id}`);

    // Device sends location update
    socket.on('location_update', (data: any) => {
      console.log(`📍 Location update from device ${data.device_id}:`, {
        lat: data.lat,
        lng: data.lng,
      });

      // Broadcast to admin dashboard
      trackingNamespace.emit('live_location', {
        device_id: data.device_id,
        lat: data.lat,
        lng: data.lng,
        accuracy: data.accuracy,
        speed: data.speed,
        timestamp: new Date(),
      });
    });

    // Device disconnects
    socket.on('disconnect', () => {
      console.log(`🔴 Device disconnected: ${socket.id}`);
      trackingNamespace.emit('device_offline', { device_id: socket.id });
    });
  });

  // Namespace for alerts
  const alertsNamespace = io.of('/alerts');

  alertsNamespace.on('connection', (socket: Socket) => {
    console.log(`✅ Client connected to alerts: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`🔴 Alert client disconnected: ${socket.id}`);
    });
  });

  // Method to broadcast SOS alert
  const broadcastSOSAlert = (alert: any) => {
    alertsNamespace.emit('sos_alert', alert);
    trackingNamespace.emit('sos_alert', alert);
  };

  return { io, trackingNamespace, alertsNamespace, broadcastSOSAlert };
};
