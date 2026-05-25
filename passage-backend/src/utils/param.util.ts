/**
 * Parameter Parsing Utilities
 * Centralized parameter parsing with type safety and error handling
 */

/**
 * Parse integer parameter from URL/query params
 * Handles both single values and arrays
 */
export const parseIntParam = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  const stringValue = Array.isArray(value) ? value[0] : String(value);
  const parsed = parseInt(stringValue, 10);
  
  if (isNaN(parsed)) {
    return defaultValue;
  }
  
  return parsed;
};

/**
 * Parse string parameter from URL/query params
 * Handles both single values and arrays
 */
export const parseStringParam = (value: any, defaultValue: string = ''): string => {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  
  return Array.isArray(value) ? value[0] : String(value);
};

/**
 * Parse float parameter from URL/query params
 */
export const parseFloatParam = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  const stringValue = Array.isArray(value) ? value[0] : String(value);
  const parsed = parseFloat(stringValue);
  
  if (isNaN(parsed)) {
    return defaultValue;
  }
  
  return parsed;
};

/**
 * Parse boolean parameter from URL/query params
 */
export const parseBooleanParam = (value: any, defaultValue: boolean = false): boolean => {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  
  const stringValue = Array.isArray(value) ? value[0] : String(value);
  return stringValue.toLowerCase() === 'true' || stringValue === '1' || stringValue === 'yes';
};

/**
 * Parse ID parameter with validation
 * Throws error if invalid
 */
export const parseIdParam = (value: any): number => {
  const id = parseIntParam(value);
  
  if (id <= 0) {
    throw new Error('Invalid ID parameter');
  }
  
  return id;
};

/**
 * Parse required string parameter
 * Throws error if empty/missing
 */
export const parseRequiredStringParam = (value: any, fieldName: string = 'Parameter'): string => {
  const parsed = parseStringParam(value).trim();
  
  if (!parsed) {
    throw new Error(`${fieldName} is required`);
  }
  
  return parsed;
};

/**
 * Safe parameter parser with try-catch
 */
export const safeParseParam = <T>(
  parser: (value: any) => T,
  value: any,
  defaultValue: T
): T => {
  try {
    return parser(value);
  } catch (error) {
    return defaultValue;
  }
};
