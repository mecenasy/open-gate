/**
 * Intelligent Error Formatter
 * Extracts, categorizes, and formats errors with context
 */

import { FormattedError, ErrorContext } from './logger.types';
import { LOGGER_CONFIG } from './logger.constants';

export class ErrorFormatter {
  /**
   * Format any error object into structured error format
   */
  static format(error: unknown, context?: ErrorContext): FormattedError {
    const timestamp = new Date().toISOString();

    if (error instanceof Error) {
      const errorCause = 'cause' in error ? (error as unknown as Record<string, unknown>).cause : undefined;
      return {
        type: this.detectErrorType(error),
        message: error.message,
        stack: this.formatStack(error.stack),
        statusCode: this.extractStatusCode(error),
        cause: errorCause instanceof Error ? errorCause.message : (errorCause as string),
        context,
        timestamp,
      };
    }

    if (typeof error === 'object' && error !== null) {
      const errorObj = error as Record<string, unknown>;
      return {
        type: this.detectErrorType(errorObj),
        message: (errorObj.message as string) || (errorObj.msg as string) || 'Unknown error occurred',
        statusCode: this.extractStatusCode(errorObj),
        stack: errorObj.stack ? this.formatStack(errorObj.stack as string | undefined) : undefined,
        cause: (errorObj.details as string) || (errorObj.reason as string),
        context,
        timestamp,
      };
    }

    return {
      type: LOGGER_CONFIG.ERROR_TYPES.UNKNOWN,
      message: String(error),
      context,
      timestamp,
    };
  }

  /**
   * Detect error type from error object
   */
  private static detectErrorType(error: unknown): string {
    if (!(typeof error === 'object' && error !== null)) {
      return LOGGER_CONFIG.ERROR_TYPES.UNKNOWN;
    }

    const errorObj = error as Record<string, unknown>;

    if (errorObj.name === 'ValidationError') return LOGGER_CONFIG.ERROR_TYPES.VALIDATION;

    const message = String((errorObj.message as string) || '').toLowerCase();
    if (message.includes('unauthorized')) return LOGGER_CONFIG.ERROR_TYPES.AUTHENTICATION;
    if (message.includes('forbidden')) return LOGGER_CONFIG.ERROR_TYPES.AUTHORIZATION;

    const statusCode = errorObj.statusCode as number | undefined;
    const code = errorObj.code as number | string | undefined;

    if (statusCode === 404 || code === 5) return LOGGER_CONFIG.ERROR_TYPES.NOT_FOUND;
    if (statusCode === 409) return LOGGER_CONFIG.ERROR_TYPES.CONFLICT;
    if (message.includes('DEADLINE_EXCEEDED')) return LOGGER_CONFIG.ERROR_TYPES.TIMEOUT;

    if (typeof code === 'number') {
      return this.grpcCodeToErrorType(code);
    }

    if (statusCode && statusCode >= 500) {
      return LOGGER_CONFIG.ERROR_TYPES.INTERNAL;
    }

    return LOGGER_CONFIG.ERROR_TYPES.UNKNOWN;
  }

  /**
   * Map gRPC error codes to error types
   */
  private static grpcCodeToErrorType(code: number): string {
    const codeMap: Record<number, string> = {
      3: LOGGER_CONFIG.ERROR_TYPES.VALIDATION,
      5: LOGGER_CONFIG.ERROR_TYPES.NOT_FOUND,
      6: LOGGER_CONFIG.ERROR_TYPES.CONFLICT,
      7: LOGGER_CONFIG.ERROR_TYPES.AUTHORIZATION,
      12: LOGGER_CONFIG.ERROR_TYPES.UNIMPLEMENTED,
      13: LOGGER_CONFIG.ERROR_TYPES.INTERNAL,
      14: LOGGER_CONFIG.ERROR_TYPES.UNAVAILABLE,
    };
    return codeMap[code] || LOGGER_CONFIG.ERROR_TYPES.GRPC;
  }

  /**
   * Extract HTTP status code from error
   */
  private static extractStatusCode(error: unknown): number | undefined {
    if (!(typeof error === 'object' && error !== null)) {
      return undefined;
    }

    const errorObj = error as Record<string, unknown>;

    if (typeof errorObj.statusCode === 'number') return errorObj.statusCode;
    if (typeof errorObj.status === 'number') return errorObj.status;

    const code = errorObj.code;
    if (typeof code === 'number' && code >= 400 && code < 600) {
      return code;
    }

    const message = String((errorObj.message as string) || '');
    if (message.includes('ECONNREFUSED')) return 503;
    if (message.includes('ETIMEDOUT')) return 504;

    return undefined;
  }

  /**
   * Format stack trace - limit to 5 frames for readability
   */
  private static formatStack(stack?: string): string | undefined {
    if (!stack) return undefined;

    const lines = stack.split('\n');
    // Keep error message + first 5 frames
    return lines.slice(0, 6).join('\n');
  }

  /**
   * Redact sensitive data from error messages and context
   */
  static redactSensitive(value: unknown): unknown {
    if (typeof value === 'string') {
      let redacted = value;

      Object.entries(LOGGER_CONFIG.SENSITIVE_PATTERNS).forEach(([key, pattern]) => {
        redacted = redacted.replace(pattern, `[REDACTED_${key}]`);
      });

      return redacted;
    }

    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.map((v) => this.redactSensitive(v));
      }

      const redacted: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value)) {
        // Skip sensitive keys entirely
        if (this.isSensitiveKey(k)) {
          redacted[k] = '[REDACTED]';
        } else {
          redacted[k] = this.redactSensitive(v);
        }
      }
      return redacted;
    }

    return value;
  }

  /**
   * Check if key name indicates sensitive data
   */
  private static isSensitiveKey(key: string): boolean {
    const sensitiveKeywords = [
      'password',
      'secret',
      'token',
      'apikey',
      'api_key',
      'authorization',
      'card',
      'ssn',
      'pin',
      'credentials',
    ];

    return sensitiveKeywords.some((keyword) => key.toLowerCase().includes(keyword));
  }

  /**
   * Create error summary for logs
   */
  static summary(formatted: FormattedError): string {
    const parts = [
      `[${formatted.type}]`,
      formatted.message,
      formatted.statusCode ? `(${formatted.statusCode})` : '',
      formatted.cause ? `- Cause: ${formatted.cause}` : '',
    ];

    return parts.filter(Boolean).join(' ');
  }
}
