/**
 * gRPC Circuit Breaker
 * Implements circuit breaker pattern for gRPC calls
 * Prevents cascading failures by failing fast when service is unavailable
 */

import { Injectable, OnModuleInit } from '@nestjs/common';
import { Logger } from '@nestjs/common';

export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Failing, reject requests
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

export interface CircuitBreakerConfig {
  failureThreshold?: number; // Failures before opening (default: 5)
  successThreshold?: number; // Successes in HALF_OPEN before closing (default: 2)
  timeout?: number; // Time in ms before trying again (default: 60000)
  name: string; // Circuit name for logging
}

@Injectable()
export class GrpcCircuitBreaker implements OnModuleInit {
  private readonly logger = new Logger('GrpcCircuitBreaker');
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: number | null = null;
  private config: Required<CircuitBreakerConfig>;

  constructor(config: CircuitBreakerConfig) {
    this.config = {
      failureThreshold: config.failureThreshold ?? 5,
      successThreshold: config.successThreshold ?? 2,
      timeout: config.timeout ?? 60000,
      name: config.name,
    };
  }

  onModuleInit() {
    this.logger.log(`Circuit Breaker initialized: ${this.config.name} (threshold: ${this.config.failureThreshold})`);
  }

  /**
   * Check if request is allowed based on circuit state
   */
  canAttempt(): boolean {
    if (this.state === CircuitState.CLOSED) {
      return true;
    }

    if (this.state === CircuitState.OPEN) {
      const timeSinceFailure = Date.now() - (this.lastFailureTime ?? 0);
      if (timeSinceFailure > this.config.timeout) {
        this.logger.log(`${this.config.name}: Transitioning to HALF_OPEN`);
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
        return true;
      }
      this.logger.warn(`${this.config.name}: Circuit OPEN, rejecting request`);
      return false;
    }

    return this.state === CircuitState.HALF_OPEN;
  }

  /**
   * Record successful request
   */
  recordSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.logger.log(`${this.config.name}: Circuit recovered, transitioning to CLOSED`);
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
      }
    }
  }

  /**
   * Record failed request
   */
  recordFailure(): void {
    this.lastFailureTime = Date.now();
    this.failureCount++;

    if (this.state === CircuitState.HALF_OPEN) {
      this.logger.warn(`${this.config.name}: Failure in HALF_OPEN, reverting to OPEN`);
      this.state = CircuitState.OPEN;
      this.successCount = 0;
      return;
    }

    if (this.failureCount >= this.config.failureThreshold && this.state === CircuitState.CLOSED) {
      this.logger.error(
        `${this.config.name}: Failure threshold reached (${this.failureCount}/${this.config.failureThreshold}), opening circuit`,
      );
      this.state = CircuitState.OPEN;
    }
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get circuit stats for monitoring
   */
  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
    };
  }

  /**
   * Reset circuit (for testing)
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.logger.log(`${this.config.name}: Circuit reset`);
  }
}
