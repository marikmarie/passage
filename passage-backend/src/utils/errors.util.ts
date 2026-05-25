/**
 * Custom Error Classes
 * Standardized error handling with proper HTTP status codes
 */

/**
 * Base API Error class
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * 400 Bad Request Error
 */
export class BadRequestError extends ApiError {
  constructor(message: string, code: string = 'BAD_REQUEST') {
    super(400, message, code);
    this.name = 'BadRequestError';
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * 401 Unauthorized Error
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized', code: string = 'UNAUTHORIZED') {
    super(401, message, code);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * 403 Forbidden Error
 */
export class ForbiddenError extends ApiError {
  constructor(
    message: string = 'Forbidden. You do not have the required permissions.',
    code: string = 'FORBIDDEN'
  ) {
    super(403, message, code);
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * 404 Not Found Error
 */
export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource', code: string = 'NOT_FOUND') {
    super(404, `${resource} not found`, code);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * 409 Conflict Error
 */
export class ConflictError extends ApiError {
  constructor(message: string, code: string = 'CONFLICT') {
    super(409, message, code);
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * 422 Validation Error
 */
export class ValidationError extends ApiError {
  constructor(message: string, code: string = 'VALIDATION_ERROR') {
    super(422, message, code);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 429 Too Many Requests Error
 */
export class RateLimitError extends ApiError {
  constructor(message: string = 'Too many requests', code: string = 'RATE_LIMITED') {
    super(429, message, code);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error', code: string = 'INTERNAL_ERROR') {
    super(500, message, code);
    this.name = 'InternalServerError';
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

/**
 * Database Error
 */
export class DatabaseError extends ApiError {
  constructor(message: string = 'Database operation failed', code: string = 'DB_ERROR') {
    super(500, message, code);
    this.name = 'DatabaseError';
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * Type guard to check if error is ApiError
 */
export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};

/**
 * Convert any error to ApiError
 */
export const toApiError = (error: unknown): ApiError => {
  if (isApiError(error)) {
    return error;
  }
  
  if (error instanceof Error) {
    return new InternalServerError(error.message);
  }
  
  return new InternalServerError(String(error));
};
