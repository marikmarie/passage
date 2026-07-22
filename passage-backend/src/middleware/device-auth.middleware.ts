import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';

export interface DeviceAuthenticatedRequest extends Request {
  device?: {
    id: number;
    imei: string;
    status: string;
  };
}

const getBearerToken = (authorizationHeader: string | undefined): string | null => {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
};

const isSameDeviceIdentifier = (requestedDeviceId: string | undefined, device: { id: number; imei: string }): boolean => {
  if (!requestedDeviceId) return true;
  return requestedDeviceId === String(device.id) || requestedDeviceId === device.imei;
};

export const authenticateDeviceToken = async (
  req: DeviceAuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No device token provided.',
        code: 'NO_DEVICE_TOKEN',
      });
      return;
    }

    const [rows] = await pool.query<any[]>(
      `SELECT id, imei, status
       FROM devices
       WHERE device_token = ?
       LIMIT 1`,
      [token],
    );

    if (!rows.length) {
      res.status(401).json({
        success: false,
        message: 'Invalid device token.',
        code: 'INVALID_DEVICE_TOKEN',
      });
      return;
    }

    const device = rows[0];

    if (['inactive', 'disabled', 'lost', 'damaged'].includes(String(device.status).toLowerCase())) {
      res.status(403).json({
        success: false,
        message: 'Device is not allowed to access watch endpoints.',
        code: 'DEVICE_NOT_ALLOWED',
      });
      return;
    }

    const requestedDeviceId = req.params.deviceId || req.body?.deviceId;
    if (!isSameDeviceIdentifier(requestedDeviceId, device)) {
      res.status(403).json({
        success: false,
        message: 'Device token does not match the requested device.',
        code: 'DEVICE_MISMATCH',
      });
      return;
    }

    req.device = {
      id: Number(device.id),
      imei: String(device.imei),
      status: String(device.status),
    };

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Device authentication failed.',
      code: 'DEVICE_AUTH_ERROR',
    });
  }
};
