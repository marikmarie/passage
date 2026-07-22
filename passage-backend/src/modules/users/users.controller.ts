import { Request, Response } from 'express';
import { usersService } from './users.service';
import { BaseController } from '../base.controller';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { ForbiddenError, NotFoundError } from '../../utils/errors.util';

const PRIVILEGED_ROLES = ['admin', 'support'];

class UsersController extends BaseController {
  private canAccessUser(req: AuthenticatedRequest, id: number): boolean {
    const currentUser = req.user;
    if (!currentUser) return false;
    return currentUser.id === id || PRIVILEGED_ROLES.includes(currentUser.role);
  }

  private canUseAdminFields(req: AuthenticatedRequest): boolean {
    return Boolean(req.user && PRIVILEGED_ROLES.includes(req.user.role));
  }

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

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id);

      if (!this.canAccessUser(req, id)) {
        throw new ForbiddenError('You can only access your own profile.');
      }

      const user = await usersService.getUserById(id);
      const validatedUser = this.ensureResourceExists(user, 'User');

      this.sendSuccess(res, 'User retrieved successfully', validatedUser);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id);

      if (!this.canAccessUser(req, id)) {
        throw new ForbiddenError('You can only update your own profile.');
      }

      const user = await usersService.updateUser(id, req.body, this.canUseAdminFields(req));
      const validatedUser = this.ensureResourceExists(user, 'User');

      this.sendSuccess(res, 'User updated successfully', validatedUser);
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
