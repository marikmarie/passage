export type UserRole = 'parent' | 'rider' | 'admin' | 'support';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'deleted';

export interface User {
  id: number;
  name: string;
  email?: string;
  password_hash?: string | null;
  role: UserRole;
  status: UserStatus;
  phone_number?: string;
  otp_code?: string | null;
  otp_expires_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  name: string;
  email?: string;
  password?: string;
  role: UserRole;
  phone_number?: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  phone_number?: string;
  status?: UserStatus;
  otp_code?: string | null;
  otp_expires_at?: Date | null;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface OtpRequestResult {
  phone_number: string;
  role: UserRole;
  expires_at: string;
  delivery_status: 'sent' | 'mocked';
  otp_code?: string;
}

export interface OtpVerificationResult {
  verified: true;
  phone_number: string;
  registration_required: true;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password_hash' | 'otp_code' | 'otp_expires_at'>;
}
