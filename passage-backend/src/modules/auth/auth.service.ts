import { authModel } from './auth.model';
import { User, CreateUserDTO, LoginDTO, AuthResponse, OtpRequestResult, OtpVerificationResult, UserRole } from '../../types/user.types';
import { hashPassword, comparePassword } from '../../utils/hash.util';
import { generateToken } from '../../utils/jwt.util';
import { collectoService } from '../../services/collecto.service';

const DEMO_OTP_CODE = '123456';

const generateOtpCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const stripSensitiveUserFields = (user: User): Omit<User, 'password_hash' | 'otp_code' | 'otp_expires_at'> => {
  const { password_hash: _, otp_code: __, otp_expires_at: ___, ...userWithoutSensitive } = user;
  return userWithoutSensitive;
};

const shouldExposeOtpInResponse = (): boolean => {
  return process.env.NODE_ENV !== 'production';
};

export class AuthService {
  async register(data: CreateUserDTO): Promise<AuthResponse> {
    const email = data.email?.toLowerCase();

    if (!data.name) {
      throw new Error('Name is required');
    }

    if (!email && !data.phone_number) {
      throw new Error('Email or phone_number is required');
    }

    if (email && !data.password) {
      throw new Error('Password is required when registering with email');
    }

    if (email) {
      const existingByEmail = await authModel.findByEmail(email);
      if (existingByEmail) {
        throw new Error('User already exists with this email');
      }
    }

    if (data.phone_number) {
      const existingByPhone = await authModel.findByPhoneNumber(data.phone_number);
      if (existingByPhone) {
        throw new Error('User already exists with this phone number');
      }
    }

    const password_hash = data.password ? hashPassword(data.password) : null;

    const user = await authModel.create({
      ...data,
      email,
      password_hash,
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: stripSensitiveUserFields(user),
    };
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    const email = data.email.toLowerCase();
    const user = await authModel.findByEmail(email);
    if (!user || !user.password_hash) {
      throw new Error('Invalid username or password');
    }

    const isPasswordValid = comparePassword(data.password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }

    if (user.status !== 'active') {
      throw new Error('User account is not active');
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: stripSensitiveUserFields(user),
    };
  }

  async requestOtp(phoneNumber: string, role: UserRole = 'parent'): Promise<OtpRequestResult> {
    const user = await authModel.findByPhoneNumber(phoneNumber);
    const otpCode = user ? generateOtpCode() : DEMO_OTP_CODE;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (user && user.status !== 'active') {
      throw new Error('User account is not active');
    }

    if (user) {
      await authModel.saveOtpCode(phoneNumber, otpCode, expiresAt);
    }

    let deliveryStatus: OtpRequestResult['delivery_status'] = user ? 'sent' : 'mocked';

    if (user) {
      try {
        await collectoService.sendSingleSMS({
          phone: phoneNumber,
          message: `Your Passage app OTP is ${otpCode}. It expires in 10 minutes.`,
          reference: `passage-otp-${Date.now()}`,
        });
      } catch (error) {
        deliveryStatus = 'mocked';
      }
    }

    return {
      phone_number: phoneNumber,
      role,
      expires_at: expiresAt.toISOString(),
      delivery_status: deliveryStatus,
      ...(shouldExposeOtpInResponse() && { otp_code: otpCode }),
    };
  }

  async verifyOtp(phoneNumber: string, otpCode: string): Promise<AuthResponse | OtpVerificationResult> {
    const user = await authModel.findByPhoneNumber(phoneNumber);

    if (!user) {
      if (otpCode !== DEMO_OTP_CODE) {
        throw new Error('Invalid or expired OTP code');
      }

      return {
        verified: true,
        phone_number: phoneNumber,
        registration_required: true,
      };
    }

    if (!user.otp_code || !user.otp_expires_at) {
      throw new Error('No OTP request found for this user');
    }

    const now = new Date();
    if (user.otp_code !== otpCode || new Date(user.otp_expires_at) < now) {
      throw new Error('Invalid or expired OTP code');
    }

    await authModel.clearOtp(phoneNumber);

    if (user.status !== 'active') {
      throw new Error('User account is not active');
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: stripSensitiveUserFields(user),
    };
  }

  async getUserById(id: number): Promise<User | null> {
    return authModel.findById(id);
  }
}

export const authService = new AuthService();
