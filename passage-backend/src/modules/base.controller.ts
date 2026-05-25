/**
 * Base Controller Class
 * Provides common functionality for all controllers
 */

import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.util';
import { parseIntParam, parseStringParam } from '../utils/param.util';
import { ApiError, NotFoundError, ValidationError } from '../utils/errors.util';
import { PAGINATION_DEFAULTS } from '../constants/app.constants';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export class BaseController {
  /**
   * Parse ID parameter from route params
   */
  protected parseId(param: any, fieldName: string = 'ID'): number {
    const id = parseIntParam(param);
    if (id <= 0) {
      throw new ValidationError(`Invalid ${fieldName}`);
    }
    return id;
  }

  /**
   * Parse string ID parameter
   */
  protected parseStringId(param: any): string {
    const id = parseStringParam(param).trim();
    if (!id) {
      throw new ValidationError('ID is required');
    }
    return id;
  }

  /**
   * Parse pagination parameters from query string
   */
  protected parsePaginationParams(query: any): PaginationParams {
    const page = parseIntParam(query.page, PAGINATION_DEFAULTS.DEFAULT_PAGE);
    const limit = parseIntParam(query.limit, PAGINATION_DEFAULTS.DEFAULT_LIMIT);

    return {
      page: Math.max(PAGINATION_DEFAULTS.DEFAULT_PAGE, page),
      limit: Math.min(
        PAGINATION_DEFAULTS.MAX_LIMIT,
        Math.max(PAGINATION_DEFAULTS.MIN_LIMIT, limit)
      )
    };
  }

  /**
   * Validate resource exists, throw 404 if not
   */
  protected ensureResourceExists<T>(resource: T | null | undefined, resourceName: string): T {
    if (!resource) {
      throw new NotFoundError(resourceName);
    }
    return resource;
  }

  /**
   * Validate required field
   */
  protected validateRequired(value: any, fieldName: string): void {
    if (!value || (typeof value === 'string' && !value.trim())) {
      throw new ValidationError(`${fieldName} is required`);
    }
  }

  /**
   * Validate multiple required fields
   */
  protected validateRequiredFields(obj: Record<string, any>, fields: string[]): void {
    for (const field of fields) {
      this.validateRequired(obj[field], field);
    }
  }

  /**
   * Send successful response
   */
  protected sendSuccess(
    res: Response,
    message: string,
    data: any = null,
    statusCode: number = 200
  ): void {
    sendSuccess(res, message, data, statusCode);
  }

  /**
   * Send paginated success response
   */
  protected sendPaginatedSuccess(
    res: Response,
    message: string,
    data: any[],
    pagination: PaginationMeta,
    statusCode: number = 200
  ): void {
    res.status(statusCode).json({
      success: true,
      message,
      data,
      pagination
    });
  }

  /**
   * Send error response
   */
  protected sendError(res: Response, message: string, statusCode: number = 400): void {
    sendError(res, message, statusCode);
  }

  /**
   * Handle API errors
   */
  protected handleApiError(res: Response, error: any): void {
    if (error instanceof ApiError) {
      this.sendError(res, error.message, error.statusCode);
    } else if (error instanceof Error) {
      this.sendError(res, error.message, 500);
    } else {
      this.sendError(res, 'An unexpected error occurred', 500);
    }
  }

  /**
   * Wrap async handler with error handling
   */
  protected asyncHandler(fn: Function) {
    return (req: Request, res: Response, next: any) => {
      Promise.resolve(fn(req, res, next)).catch((error) => {
        this.handleApiError(res, error);
      });
    };
  }

  /**
   * Calculate pagination metadata
   */
  protected calculatePaginationMeta(
    total: number,
    page: number,
    limit: number
  ): PaginationMeta {
    const pages = Math.ceil(total / limit);
    return {
      total,
      page,
      limit,
      pages
    };
  }

  /**
   * Calculate offset for SQL queries
   */
  protected calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Extract user ID from authenticated request
   */
  protected getUserId(req: any): number {
    const userId = req.user?.id;
    if (!userId) {
      throw new ValidationError('User ID not found in request');
    }
    return userId;
  }

  /**
   * Extract user from authenticated request
   */
  protected getUser(req: any) {
    const user = req.user;
    if (!user) {
      throw new ValidationError('User not found in request');
    }
    return user;
  }
}
