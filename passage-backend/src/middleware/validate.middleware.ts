import { Request, Response, NextFunction } from 'express';

export interface ValidationRule {
  [key: string]: {
    required?: boolean;
    type?: 'string' | 'number' | 'email' | 'boolean';
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  };
}

export const validateRequest = (rules: ValidationRule) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: { [key: string]: string } = {};

    for (const field in rules) {
      const rule = rules[field];
      const value = req.body[field];

      if (rule.required && (value === undefined || value === null || value === '')) {
        errors[field] = `${field} is required`;
        continue;
      }

      if (value) {
        if (rule.type === 'email' && !isValidEmail(value)) {
          errors[field] = `${field} must be a valid email`;
        }
        if (rule.type === 'number' && isNaN(value)) {
          errors[field] = `${field} must be a number`;
        }
        if (rule.minLength && value.length < rule.minLength) {
          errors[field] = `${field} must be at least ${rule.minLength} characters`;
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors[field] = `${field} must not exceed ${rule.maxLength} characters`;
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          errors[field] = `${field} format is invalid`;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({ success: false, message: 'Validation failed', errors });
      return;
    }

    next();
  };
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
