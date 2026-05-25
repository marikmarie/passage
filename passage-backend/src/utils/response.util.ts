import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Send success response
 */
export const sendSuccess = (
  res: Response,
  message: string,
  data: any = null,
  statusCode: number = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400
): Response => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};

/**
 * Send paginated response
 */
export const sendPaginated = <T>(
  res: Response,
  message: string,
  data: T[],
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  },
  statusCode: number = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination
  });
};
