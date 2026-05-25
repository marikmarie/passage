import { Request, Response } from 'express';
import { usersService } from './users.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class UsersController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt((req.query.page as string) || '1') || 1;
      const limit = parseInt((req.query.limit as string) || '10') || 10;
      const role = req.query.role;
      const result = await usersService.getAllUsers(page, limit, role as string);
      sendSuccess(res, 'Users retrieved successfully', result);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id || '');
      const user = await usersService.getUserById(parseInt(id));

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

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id || '');
      const updates = req.body;

      const user = await usersService.updateUser(parseInt(id), updates);

      if (!user) {
        sendError(res, 'User not found', 404);
        return;
      }

      const { password_hash: _, ...userWithoutPassword } = user;
      sendSuccess(res, 'User updated successfully', userWithoutPassword);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id || '');

      const success = await usersService.deleteUser(parseInt(id));

      if (!success) {
        sendError(res, 'User not found', 404);
        return;
      }

      sendSuccess(res, 'User deleted successfully', { id: parseInt(id) });
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}

export const usersController = new UsersController();
