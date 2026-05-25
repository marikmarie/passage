import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export const generateToken = (payload: any, expiresIn: string = '24h'): string => {
  const secret = env.JWT_SECRET as string;
  const options: SignOptions = { expiresIn: expiresIn as any };
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): any => {
  try {
    const secret = env.JWT_SECRET as string;
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
