import { usersModel } from './users.model';
import { User, UpdateUserDTO } from '../../types/user.types';
import { getPaginationOptions, calculateOffset } from '../../utils/pagination.util';

export type SafeUser = Omit<User, 'password_hash' | 'otp_code' | 'otp_expires_at'>;

const SELF_UPDATE_FIELDS = ['name', 'email', 'phone_number'];
const ADMIN_UPDATE_FIELDS = [...SELF_UPDATE_FIELDS, 'role', 'status'];

export class UsersService {
  sanitizeUser(user: User): SafeUser {
    const { password_hash: _passwordHash, otp_code: _otpCode, otp_expires_at: _otpExpiresAt, ...safeUser } = user;
    return safeUser;
  }

  sanitizeUsers(users: User[]): SafeUser[] {
    return users.map((user) => this.sanitizeUser(user));
  }

  async getUserById(id: number): Promise<SafeUser | null> {
    const user = await usersModel.findById(id);
    return user ? this.sanitizeUser(user) : null;
  }

  async getAllUsers(page?: string | number, limit?: string | number, role?: string): Promise<{ data: SafeUser[]; total: number }> {
    const { page: p, limit: l } = getPaginationOptions(page, limit);
    const offset = calculateOffset(p, l);

    const { users, total } = await usersModel.findAll(l, offset, role);

    return {
      data: this.sanitizeUsers(users),
      total,
    };
  }

  async updateUser(id: number, updates: UpdateUserDTO, allowAdminFields = false): Promise<SafeUser | null> {
    const allowedFields = allowAdminFields ? ADMIN_UPDATE_FIELDS : SELF_UPDATE_FIELDS;
    const safeUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key]) => allowedFields.includes(key))
    ) as UpdateUserDTO;

    const user = await usersModel.update(id, safeUpdates);
    return user ? this.sanitizeUser(user) : null;
  }

  async deleteUser(id: number): Promise<boolean> {
    return usersModel.delete(id);
  }
}

export const usersService = new UsersService();
