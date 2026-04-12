/**
 * Custom Logger Type Definitions
 * Intelligent error logging with context and correlation IDs
 */

export type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose';

export interface ErrorContext {
  userId?: string | number;
  correlationId?: string;
  requestId?: string;
  service?: string;
  context?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface FormattedError {
  type: string;
  message: string;
  statusCode?: number;
  stack?: string;
  cause?: string;
  context?: ErrorContext;
  timestamp: string;
}

export interface LoggerConfig {
  enableColors?: boolean;
  enableTimestamps?: boolean;
  enableContext?: boolean;
  serviceId?: string;
  environment?: string;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  error?: FormattedError;
  timestamp: string;
}

export enum LogPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3,
}

export interface LogMetadata {
  userId?: string;
  correlationId?: string;
  requestId?: string;
  service?: string;
  environment?: string;
  timestamp: string;
}
