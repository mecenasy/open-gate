import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import { ICommand } from '@nestjs/cqrs';
import { type ClientGrpc } from '@nestjs/microservices';
import { DbGrpcKey } from '@app/db-grpc';
import { CacheService } from '@app/redis';
import { EventService } from '@app/event';
import { IBaseHandler } from './base-handler';

export abstract class Handler<T extends ICommand, R, S extends object = any>
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

  constructor(public readonly serviceName?: string) {
    this.logger = new Logger(this.constructor.name);
  }

  onModuleInit() {
    if (this.serviceName) {
      this.gRpcService = this.grpcClient.getService<S>(this.serviceName);
    }
  }

  abstract execute(command: T): Promise<R>;
}
