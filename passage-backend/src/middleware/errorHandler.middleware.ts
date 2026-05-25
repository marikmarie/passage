import { Request, Response, NextFunction } from 'express';
import { isApiError, toApiError } from '../utils/errors.util';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('🔥 Error Handler Caught:', err);

  // Convert to ApiError if necessary
  const apiError = isApiError(err) ? err : toApiError(err);

  res.status(apiError.statusCode).json({
    success: false,
    message: apiError.message,
    code: apiError.code,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
