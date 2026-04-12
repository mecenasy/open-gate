/**
 * Logger Constants and Configuration
 */

export const LOGGER_CONFIG = {
  // Color codes for terminal output
  COLORS: {
    RESET: '\x1b[0m',
    RED: '\x1b[31m',
    YELLOW: '\x1b[33m',
    GREEN: '\x1b[32m',
    BLUE: '\x1b[34m',
    CYAN: '\x1b[36m',
    GRAY: '\x1b[90m',
  },

  // Log level prefixes
  PREFIXES: {
    log: '[LOG]',
    error: '[ERROR]',
    warn: '[WARN]',
    debug: '[DEBUG]',
    verbose: '[VERBOSE]',
  },

  // Error type mapping for better error categorization
  ERROR_TYPES: {
    VALIDATION: 'ValidationError',
    AUTHENTICATION: 'AuthenticationError',
    AUTHORIZATION: 'AuthorizationError',
    NOT_FOUND: 'NotFoundError',
    CONFLICT: 'ConflictError',
    INTERNAL: 'InternalServerError',
    GRPC: 'GrpcError',
    DATABASE: 'DatabaseError',
    EXTERNAL_API: 'ExternalApiError',
    TIMEOUT: 'TimeoutError',
    UNAVAILABLE: 'UnavailableError',
    UNIMPLEMENTED: 'UnimplementedError',
    UNKNOWN: 'UnknownError',
  },

  // HTTP Status Code Mapping
  STATUS_CODES: {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  },

  // gRPC Error Codes
  GRPC_CODES: {
    0: 'OK',
    1: 'CANCELLED',
    2: 'UNKNOWN',
    3: 'INVALID_ARGUMENT',
    4: 'DEADLINE_EXCEEDED',
    5: 'NOT_FOUND',
    6: 'ALREADY_EXISTS',
    7: 'PERMISSION_DENIED',
    8: 'RESOURCE_EXHAUSTED',
    9: 'FAILED_PRECONDITION',
    10: 'ABORTED',
    11: 'OUT_OF_RANGE',
    12: 'UNIMPLEMENTED',
    13: 'INTERNAL',
    14: 'UNAVAILABLE',
    15: 'DATA_LOSS',
    16: 'UNAUTHENTICATED',
  },

  // Sensitive data patterns to redact from logs
  SENSITIVE_PATTERNS: {
    PASSWORD: /password["\s:=]+([^\s,}]+)/gi,
    TOKEN: /token["\s:=]+([^\s,}]+)/gi,
    API_KEY: /api[_-]?key["\s:=]+([^\s,}]+)/gi,
    SECRET: /secret["\s:=]+([^\s,}]+)/gi,
    CREDIT_CARD: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  },

  // Performance thresholds
  THRESHOLDS: {
    SLOW_QUERY_MS: 1000,
    SLOW_API_CALL_MS: 5000,
    SLOW_GRPC_CALL_MS: 3000,
  },
};

// Environment detection
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const IS_TESTING = process.env.NODE_ENV === 'test';

// Default logger context
export const DEFAULT_LOGGER_CONTEXT = {
  enableColors: !IS_PRODUCTION,
  enableTimestamps: true,
  enableContext: true,
  serviceId: process.env.SERVICE_ID || 'unknown-service',
  environment: process.env.NODE_ENV || 'development',
};
