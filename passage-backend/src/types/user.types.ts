export type UserRole = 'parent' | 'rider' | 'admin' | 'support';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'deleted';

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  phone?: string;
  status?: UserStatus;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password_hash'>;
}
