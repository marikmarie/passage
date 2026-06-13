import { Request, Response } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role = 'parent', phone_number } = req.body;

      if (!name || (!email && !phone_number)) {
        sendError(res, 'Name and either email or phone_number are required', 400);
        return;
      }

      if (!email && role === 'admin') {
        sendError(res, 'Admins must register with email and password', 400);
        return;
      }

      const result = await authService.register({
        name,
        email,
        password,
        role,
        phone_number,
      });

      sendSuccess(res, 'User registered successfully', result, 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        sendError(res, 'Email and password are required', 400);
        return;
      }

      const result = await authService.login({ email, password });
      sendSuccess(res, 'Login successful', result);
    } catch (error: any) {
      sendError(res, error.message, 401);
    }
  }

  async requestOtp(req: Request, res: Response): Promise<void> {
    try {
      const { phone_number } = req.body;

      if (!phone_number) {
        sendError(res, 'Phone number is required', 400);
        return;
      }

      await authService.requestOtp(phone_number);
      sendSuccess(res, 'OTP sent successfully', { phone_number });
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { phone_number, otp_code } = req.body;

      if (!phone_number || !otp_code) {
        sendError(res, 'Phone number and OTP code are required', 400);
        return;
      }

      const result = await authService.verifyOtp(phone_number, otp_code);
      sendSuccess(res, 'OTP verified successfully', result);
    } catch (error: any) {
      sendError(res, error.message, 401);
    }
  }

  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }

      const user = await authService.getUserById(req.user.id);
      if (!user) {
        sendError(res, 'User not found', 404);
        return;
      }

      const { password_hash: _, otp_code: __, otp_expires_at: ___, ...userWithoutSensitive } = user;
      sendSuccess(res, 'User retrieved successfully', userWithoutSensitive);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}

export const authController = new AuthController();
