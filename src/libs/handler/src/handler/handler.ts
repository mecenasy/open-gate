import { Inject, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { ICommand } from '@nestjs/cqrs';
import { type ClientGrpc } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { DbGrpcKey } from '@app/db-grpc';
import { CacheService } from '@app/redis';
import { EventService } from '@app/event';
import { IBaseHandler } from './base-handler';

export const CORRELATION_SERVICE_TOKEN = 'CORRELATION_SERVICE';

export interface ICorrelationService {
  getId(): string | undefined;
}

export abstract class Handler<T extends ICommand, R, S extends object = object>
  implements IBaseHandler<T, R>, OnModuleInit
{
  public gRpcService!: S;
  logger: Logger;

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
  }

  onModuleInit() {
    if (this.serviceName) {
      const raw = this.grpcClient.getService<S>(this.serviceName);
      this.gRpcService = this.createGrpcProxy(raw);
    }
  }

  private createGrpcProxy<U extends object>(service: U): U {
    const correlationService = this.correlationService;

    return new Proxy(service, {
      get(target, prop) {
        const value = target[prop as keyof U];
        if (typeof value !== 'function') return value;

        return (data: unknown, existingMetadata?: Metadata) => {
          const metadata = existingMetadata ?? new Metadata();
          const correlationId = correlationService?.getId();
          if (correlationId) {
            metadata.set('x-correlation-id', correlationId);
          }
          return (value as (...args: unknown[]) => unknown).call(target, data, metadata);
        };
      },
    });
  }

  abstract execute(command: T): Promise<R>;
}
