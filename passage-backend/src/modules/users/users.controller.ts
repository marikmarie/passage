import { Request, Response } from 'express';
import { usersService } from './users.service';
import { BaseController } from '../base.controller';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { NotFoundError } from '../../utils/errors.util';

class UsersController extends BaseController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit } = this.parsePaginationParams(req.query);
      const role = req.query.role ? String(req.query.role) : undefined;

      const result = await usersService.getAllUsers(page, limit, role);
      
      const pagination = this.calculatePaginationMeta(result.total, page, limit);
      this.sendPaginatedSuccess(res, 'Users retrieved successfully', result.data, pagination);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id);
      const user = await usersService.getUserById(id);

      const validatedUser = this.ensureResourceExists(user, 'User');

      // Remove password hash from response
      const { password_hash: _, ...userWithoutPassword } = validatedUser;
      this.sendSuccess(res, 'User retrieved successfully', userWithoutPassword);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id);
      const updates = req.body;

      const user = await usersService.updateUser(id, updates);

      const validatedUser = this.ensureResourceExists(user, 'User');

      // Remove password hash from response
      const { password_hash: _, ...userWithoutPassword } = validatedUser;
      this.sendSuccess(res, 'User updated successfully', userWithoutPassword);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id);
      const success = await usersService.deleteUser(id);

      if (!success) {
        throw new NotFoundError('User');
      }

      this.sendSuccess(res, 'User deleted successfully', { id });
    } catch (error) {
      this.handleApiError(res, error);
    }
  }
}

export const usersController = new UsersController();
