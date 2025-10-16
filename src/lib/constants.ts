/**
 * Application-wide constants
 */

// Sync intervals
export const SYNC_INTERVALS = {
  AUTO_SYNC: 5 * 60 * 1000, // 5 minutes
  RETRY_DELAY: 30 * 1000, // 30 seconds
  MAX_RETRY_ATTEMPTS: 3,
} as const;

// Storage keys
export const STORAGE_KEYS = {
  MOMENTS: 'thoughts_offline_moments',
  USER_DATA: 'thoughts_user_data',
  PREFERENCES: 'thoughts_preferences',
} as const;

// Database configuration
export const DB_CONFIG = {
  NAME: 'thoughtsAppDatabase',
  VERSION: 3,
} as const;

// Photo upload limits
export const PHOTO_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1920,
  QUALITY: 0.85,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// Input validation
export const INPUT_VALIDATION = {
  MAX_CONTENT_LENGTH: 5000,
  MAX_FEELING_LENGTH: 100,
  MIN_CONTENT_LENGTH: 1,
} as const;

// Query keys for React Query
export const QUERY_KEYS = {
  MOMENTS: 'moments',
  USER_PROFILE: 'user_profile',
  PREFERENCES: 'preferences',
  SYNC_STATUS: 'sync_status',
} as const;

// Mood detection keywords
export const MOOD_KEYWORDS = {
  LONGING: ['miss', 'longing', 'yearn'],
  HAPPY: ['happy', 'joy', 'glad', 'cheerful', 'delighted'],
  SAD: ['sad', 'down', 'unhappy', 'blue', 'depressed'],
  EXCITED: ['excited', 'thrilled', 'enthusiastic', 'eager'],
  NOSTALGIC: ['nostalgic', 'remember', 'reminisce', 'recall'],
  HOPEFUL: ['hope', 'dream', 'wish', 'aspire'],
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  AUTH_REQUIRED: 'Authentication required. Please sign in.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SAVE_FAILED: 'Failed to save your moment. Please try again.',
  LOAD_FAILED: 'Failed to load moments. Please try again.',
  SYNC_FAILED: 'Failed to sync data. Will retry later.',
  INVALID_INPUT: 'Invalid input. Please check your data.',
  FILE_TOO_LARGE: 'File is too large. Maximum size is 5MB.',
  UNSUPPORTED_FILE_TYPE: 'Unsupported file type. Please use JPEG, PNG, or WebP.',
} as const;
