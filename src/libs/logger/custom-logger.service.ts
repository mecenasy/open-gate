/**
 * Custom Logger Service
 * Intelligent logging compatible with NestJS Logger interface
 * Supports error context, correlation IDs, and service-to-service tracing
 */

import { Injectable, LoggerService, Optional } from '@nestjs/common';
import { type LoggerConfig, LogLevel, ErrorContext } from './logger.types';
import { ErrorFormatter } from './error-formatter';
import { LOGGER_CONFIG, IS_PRODUCTION, DEFAULT_LOGGER_CONTEXT } from './logger.constants';

@Injectable()
export class CustomLogger implements LoggerService {
  private context?: string;
  private config: Required<LoggerConfig>;
  private correlationId?: string;
  private requestId?: string;
  private userId?: string | number;

  constructor(@Optional() config?: LoggerConfig) {
    this.config = { ...DEFAULT_LOGGER_CONTEXT, ...config };
  }

  /**
   * Set context for this logger instance
   * Shows up in all logs from this instance
   */
  setContext(context: string): CustomLogger {
    this.context = context;
    return this;
  }

  /**
   * Set correlation ID for tracing across services
   */
  setCorrelationId(correlationId: string): CustomLogger {
    this.correlationId = correlationId;
    return this;
  }

  /**
   * Set request ID for tracing single request
   */
  setRequestId(requestId: string): CustomLogger {
    this.requestId = requestId;
    return this;
  }

  /**
   * Set current user ID for user-scoped logging
   */
  setUserId(userId: string | number): CustomLogger {
    this.userId = userId;
    return this;
  }

  /**
   * Log a message (info level)
   * Usage: logger.log('User created', { userId: 123 })
   */
  log(message: any, context?: any): void {
    this.writeLog('log', message, context);
  }

  /**
   * Log an error with intelligent formatting
   * Usage: logger.error('Failed to create user', error, { userId: 123 })
   */
  error(message: any, trace?: any, context?: any): void {
    const errorContext = this.buildErrorContext(
      typeof context === 'object' && context !== null ? (context as Record<string, unknown>) : undefined,
    );
    this.writeLog('error', message, trace || context, errorContext);
  }

  /**
   * Log a warning
   * Usage: logger.warn('Low disk space', { diskUsage: '95%' })
   */
  warn(message: any, context?: any): void {
    this.writeLog('warn', message, context);
  }

  /**
   * Log debug information (only in development)
   * Usage: logger.debug('Query parameters', { params: {...} })
   */
  debug(message: any, context?: any): void {
    if (!IS_PRODUCTION) {
      this.writeLog('debug', message, context);
    }
  }

  /**
   * Log verbose information (only in development)
   * Usage: logger.verbose('Processing user data', data)
   */
  verbose(message: any, context?: any): void {
    if (!IS_PRODUCTION) {
      this.writeLog('verbose', message, context);
    }
  }

  /**
   * Log API call with performance metrics
   */
  logApiCall(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: Record<string, unknown>,
  ): void {
    const slow = duration > LOGGER_CONFIG.THRESHOLDS.SLOW_API_CALL_MS;
    const level: LogLevel = slow ? 'warn' : 'log';

    const message = `${method} ${url} ${statusCode} (${duration}ms)`;
    const data = { ...(context || {}), statusCode, duration, slow };

    this.writeLog(level, message, data);
  }

  /**
   * Log gRPC call with performance metrics
   */
  logGrpcCall(
    service: string,
    method: string,
    statusCode: number,
    duration: number,
    context?: Record<string, unknown>,
  ): void {
    const slow = duration > LOGGER_CONFIG.THRESHOLDS.SLOW_GRPC_CALL_MS;
    const level: LogLevel = slow ? 'warn' : 'log';

    const message = `gRPC ${service}.${method} (code: ${statusCode}) [${duration}ms]`;
    const data = { ...(context || {}), grpcCode: statusCode, duration, slow };

    this.writeLog(level, message, data);
  }

  /**
   * Log database query with performance metrics
   */
  logDbQuery(query: string, duration: number, context?: Record<string, unknown>): void {
    const slow = duration > LOGGER_CONFIG.THRESHOLDS.SLOW_QUERY_MS;
    const level: LogLevel = slow ? 'warn' : 'debug';

    if (level === 'debug' && IS_PRODUCTION) return; // Skip debug in production

    const truncatedQuery = query.substring(0, 100) + (query.length > 100 ? '...' : '');
    const message = `Database Query [${duration}ms]: ${truncatedQuery}`;
    const data = { ...(context || {}), duration, slow };

    this.writeLog(level, message, data);
  }

  /**
   * Create child logger with inherited context
   */
  child(context: string): CustomLogger {
    const child = new CustomLogger(this.config);
    child.context = `${this.context}:${context}`;
    child.correlationId = this.correlationId;
    child.requestId = this.requestId;
    child.userId = this.userId;
    return child;
  }

  /**
   * Private method to format and write log
   */
  private writeLog(level: LogLevel, message: unknown, context?: unknown, errorContext?: ErrorContext): void {
    try {
      const timestamp = new Date().toISOString();
      const prefix = this.buildPrefix(level);
      const contextStr = this.buildContextString();

      let logMessage = `${prefix} ${String(message)}`;

      if (contextStr) {
        logMessage += ` ${contextStr}`;
      }

      const contextRecord =
        typeof context === 'object' && context !== null
          ? (context as Record<string, unknown>)
          : typeof context === 'string'
            ? context
            : undefined;
      const output = this.formatOutput(logMessage, level, contextRecord, errorContext, timestamp);

      // Write to stdout
      if (level === 'error' || level === 'warn') {
        console.error(output);
      } else {
        console.log(output);
      }
    } catch (err) {
      // Failsafe: never let logging errors crash the app
      console.error('[Logger Error]', err);
    }
  }

  /**
   * Build log level prefix with colors
   */
  private buildPrefix(level: LogLevel): string {
    const prefix = LOGGER_CONFIG.PREFIXES[level];

    if (!this.config.enableColors) {
      return prefix;
    }

    const colorMap: Record<LogLevel, string> = {
      log: LOGGER_CONFIG.COLORS.GREEN,
      error: LOGGER_CONFIG.COLORS.RED,
      warn: LOGGER_CONFIG.COLORS.YELLOW,
      debug: LOGGER_CONFIG.COLORS.BLUE,
      verbose: LOGGER_CONFIG.COLORS.CYAN,
    };

    return `${colorMap[level]}${prefix}${LOGGER_CONFIG.COLORS.RESET}`;
  }

  /**
   * Build context string from context, correlation ID, request ID
   */
  private buildContextString(): string {
    const parts: string[] = [];

    if (this.context) {
      parts.push(`{${this.context}}`);
    }

    if (this.correlationId) {
      parts.push(`[correlation: ${this.correlationId}]`);
    }

    if (this.requestId) {
      parts.push(`[request: ${this.requestId}]`);
    }

    if (this.userId) {
      parts.push(`[user: ${this.userId}]`);
    }

    return parts.join(' ');
  }

  /**
   * Build error context object for error logging
   */
  private buildErrorContext(context?: Record<string, unknown>): ErrorContext {
    return {
      userId: this.userId,
      correlationId: this.correlationId,
      requestId: this.requestId,
      service: this.config.serviceId,
      context: typeof context === 'object' && context !== null ? context : undefined,
    };
  }

  /**
   * Format the complete log output
   */
  private formatOutput(
    logMessage: string,
    level: LogLevel,
    context?: Record<string, unknown> | string,
    errorContext?: ErrorContext,
    timestamp?: string,
  ): string {
    const parts: string[] = [];

    // Add timestamp if enabled
    if (this.config.enableTimestamps && timestamp) {
      parts.push(`[${timestamp}]`);
    }

    // Add main message
    parts.push(logMessage);

    // Add context data if present
    if (context && typeof context === 'object') {
      const redacted = ErrorFormatter.redactSensitive(context);

      if (level === 'error' && context instanceof Error) {
        const formatted = ErrorFormatter.format(context, errorContext);
        parts.push('\n  Error:', ErrorFormatter.summary(formatted));
        if (formatted.stack && !IS_PRODUCTION) {
          parts.push('\n  Stack:', formatted.stack);
        }
      } else {
        const contextStr = JSON.stringify(redacted, null, 2);
        if (contextStr.length < 500) {
          parts.push(`\n  Context: ${contextStr}`);
        } else {
          parts.push(`\n  Context: ${contextStr.substring(0, 500)}...[truncated]`);
        }
      }
    } else if (context && typeof context === 'string') {
      if (level === 'error') {
        parts.push(`\n  Details: ${context}`);
      } else {
        parts.push(`- ${context}`);
      }
    }

    return parts.join('');
  }
}
