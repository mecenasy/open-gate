import { BadRequestException, Inject, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { ICommand } from '@nestjs/cqrs';
import { type ClientGrpc } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { DbGrpcKey } from '@app/db-grpc';
import { CacheService } from '@app/redis';
import { EventService } from '@app/event';
import { IBaseHandler } from './base-handler';
import { GrpcCircuitBreaker } from '../grpc-circuit-breaker';

export const CORRELATION_SERVICE_TOKEN = 'CORRELATION_SERVICE';

export interface ICorrelationService {
  getId(): string | undefined;
}

export abstract class Handler<T extends ICommand, R, S extends object = object>
  implements IBaseHandler<T, R>, OnModuleInit {
  public gRpcService!: S;
  logger: Logger;
  protected circuitBreaker: GrpcCircuitBreaker;

  @Inject(DbGrpcKey)
  public readonly grpcClient!: ClientGrpc;

  @Inject(CacheService)
  public readonly cache!: CacheService;

  @Inject(EventService)
  public readonly event!: EventService;

  @Optional()
  @Inject(CORRELATION_SERVICE_TOKEN)
  private readonly correlationService?: ICorrelationService;

  constructor(public readonly serviceName?: string) {
    this.logger = new Logger(this.constructor.name);
    this.circuitBreaker = new GrpcCircuitBreaker({
      name: serviceName ?? 'unknown-service',
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
    });
  }

  onModuleInit() {
    if (this.serviceName) {
      const raw = this.grpcClient.getService<S>(this.serviceName);
      this.gRpcService = this.createGrpcProxy(raw);
    }
  }

  private createGrpcProxy<U extends object>(service: U): U {
    const correlationService = this.correlationService;
    const circuitBreaker = this.circuitBreaker;
    const logger = this.logger;

    return new Proxy(service, {
      get(target, prop) {
        const value = target[prop as keyof U];
        if (typeof value !== 'function') return value;

        return (data: unknown, existingMetadata?: Metadata) => {
          // Check if circuit is open
          if (!circuitBreaker.canAttempt()) {
            throw new Error(`gRPC service unavailable: ${circuitBreaker.getState()}. Please retry later.`);
          }

          const metadata = existingMetadata ?? new Metadata();
          const correlationId = correlationService?.getId();
          if (correlationId) {
            metadata.set('x-correlation-id', correlationId);
          }

          try {
            const result = (value as (...args: unknown[]) => unknown).call(target, data, metadata);

            // If it's a promise, track success/failure
            if (result instanceof Promise) {
              return result
                .then((res) => {
                  circuitBreaker.recordSuccess();
                  return res as unknown;
                })
                .catch((error: Error) => {
                  circuitBreaker.recordFailure();
                  logger.error(`gRPC call failed: ${error.message}`, error);
                  throw error;
                });
            }

            circuitBreaker.recordSuccess();
            return result;
          } catch (error) {
            circuitBreaker.recordFailure();
            throw error;
          }
        };
      },
    });
  }

  protected checkGrpcResponse<U extends { status?: boolean; message?: string }>(
    response: U | null | undefined,
    errorMessage?: string,
  ): U {
    if (!response || response.status === false) {
      throw new BadRequestException(response?.message ?? errorMessage ?? 'Request failed');
    }
    return response;
  }

  abstract execute(command: T): Promise<R>;
}
