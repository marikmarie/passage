import { Request, Response } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role = 'parent', phone } = req.body;

      if (!name || !email || !password) {
        sendError(res, 'Missing required fields', 400);
        return;
      }

      const result = await authService.register({
        name,
        email,
        password,
        role,
        phone,
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

      const { password_hash: _, ...userWithoutPassword } = user;
      sendSuccess(res, 'User retrieved successfully', userWithoutPassword);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}

export const authController = new AuthController();
