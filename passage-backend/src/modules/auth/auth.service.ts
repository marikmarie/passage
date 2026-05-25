import { userModel } from './auth.model';
import { User, CreateUserDTO, LoginDTO, AuthResponse } from '../../types/user.types';
import { hashPassword, comparePassword } from '../../utils/hash.util';
import { generateToken } from '../../utils/jwt.util';

export class AuthService {
  async register(data: CreateUserDTO): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await userModel.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const password_hash = hashPassword(data.password);

    // Create user
    const user = await userModel.create({
      ...data,
      password_hash,
    });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password from response
    const { password_hash: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword as Omit<User, 'password_hash'>,
    };
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    // Find user by email
    const user = await userModel.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Compare password
    const isPasswordValid = comparePassword(data.password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Check user status
    if (user.status !== 'active') {
      throw new Error('User account is not active');
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password from response
    const { password_hash: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword as Omit<User, 'password_hash'>,
    };
  }

  async getUserById(id: number): Promise<User | null> {
    return userModel.findById(id);
  }
}

export const authService = new AuthService();
