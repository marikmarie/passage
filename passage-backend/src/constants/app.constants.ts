/**
 * Application Constants
 * Centralized constants for roles, statuses, and other enumerated values
 */

// User Roles
export const USER_ROLES = {
  PARENT: 'parent',
  ADMIN: 'admin',
  SUPPORT: 'support',
  RIDER: 'rider'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

// Trip Status
export const TRIP_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export type TripStatus = typeof TRIP_STATUS[keyof typeof TRIP_STATUS];

// Device Status
export const DEVICE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  OFFLINE: 'offline'
} as const;

export type DeviceStatus = typeof DEVICE_STATUS[keyof typeof DEVICE_STATUS];

// Alert Status
export const ALERT_STATUS = {
  ACTIVE: 'active',
  RESOLVED: 'resolved',
  IGNORED: 'ignored'
} as const;

export type AlertStatus = typeof ALERT_STATUS[keyof typeof ALERT_STATUS];

// Alert Severity
export const ALERT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

export type AlertSeverity = typeof ALERT_SEVERITY[keyof typeof ALERT_SEVERITY];

// Alert Types
export const ALERT_TYPES = {
  GEOFENCE_ENTRY: 'geofence_entry',
  GEOFENCE_EXIT: 'geofence_exit',
  SPEED_ALERT: 'speed_alert',
  OFFLINE: 'device_offline',
  LOW_BATTERY: 'low_battery',
  SOS: 'sos_triggered',
  ROUTE_DEVIATION: 'route_deviation'
} as const;

export type AlertType = typeof ALERT_TYPES[keyof typeof ALERT_TYPES];

// Geofence Types
export const GEOFENCE_TYPES = {
  SAFE: 'safe',
  DANGER: 'danger',
  SCHOOL: 'school',
  HOME: 'home',
  CUSTOM: 'custom'
} as const;

export type GeofenceType = typeof GEOFENCE_TYPES[keyof typeof GEOFENCE_TYPES];

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  BASIC: 'basic',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise'
} as const;

export type SubscriptionPlan = typeof SUBSCRIPTION_PLANS[keyof typeof SUBSCRIPTION_PLANS];

// Subscription Status
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  PENDING: 'pending'
} as const;

export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS];

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// Payment Methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
  MOBILE_WALLET: 'mobile_wallet'
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

// Notification Types
export const NOTIFICATION_TYPES = {
  TRIP_ALERT: 'trip_alert',
  ALERT: 'alert',
  PAYMENT: 'payment',
  SUBSCRIPTION: 'subscription',
  SYSTEM: 'system'
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

// Pagination Defaults
export const PAGINATION_DEFAULTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1
} as const;

// API Response Codes
export const RESPONSE_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500
} as const;

// Date Formats
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  ISO_DATETIME: 'YYYY-MM-DD HH:mm:ss',
  ISO_DATETIME_MS: 'YYYY-MM-DD HH:mm:ss.SSS'
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^\+?[1-9]\d{1,14}$/,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100
} as const;

// Rate Limit
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100
} as const;

// Cache TTL (in seconds)
export const CACHE_TTL = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 900,     // 15 minutes
  LONG: 3600,      // 1 hour
  VERY_LONG: 86400 // 24 hours
} as const;
