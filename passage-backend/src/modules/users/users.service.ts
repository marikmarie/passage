import { usersModel } from './users.model';
import { User, UpdateUserDTO } from '../../types/user.types';
import { getPaginationOptions, calculateOffset } from '../../utils/pagination.util';

export class UsersService {
  async getUserById(id: number): Promise<User | null> {
    return usersModel.findById(id);
  }

  async getAllUsers(page?: string | number, limit?: string | number, role?: string): Promise<any> {
    const { page: p, limit: l } = getPaginationOptions(page, limit);
    const offset = calculateOffset(p, l);

    const { users, total } = await usersModel.findAll(l, offset, role);

    return {
      users,
      pagination: {
        total,
        page: p,
        limit: l,
        pages: Math.ceil(total / l),
      },
    };
  }

  async updateUser(id: number, updates: UpdateUserDTO): Promise<User | null> {
    return usersModel.update(id, updates);
  }

  async deleteUser(id: number): Promise<boolean> {
    return usersModel.delete(id);
  }
}

export const usersService = new UsersService();
