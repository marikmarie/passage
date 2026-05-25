import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user || !roles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          message: 'Forbidden. You do not have the required permissions.',
          code: 'INSUFFICIENT_PERMISSIONS',
          requiredRoles: roles,
          userRole: req.user?.role
        });
        return;
      }
      next();
    } catch (error) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have the required permissions.',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
  };
};
