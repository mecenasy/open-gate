import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import { ICommand } from '@nestjs/cqrs';
import { type ClientGrpc } from '@nestjs/microservices';
import { GrpcDbProxyKey } from '../proxy/constance';
import { CacheService } from '../cache/cache.service';
import { EventService } from '../event/event.service';
import { IBaseHandler } from './base-handler';

export abstract class Handler<T extends ICommand, R, S extends object = any>
  implements IBaseHandler<T, R>, OnModuleInit
{
  public gRpcService!: S;
  logger: Logger;

  @Inject(GrpcDbProxyKey)
  public readonly grpcClient!: ClientGrpc;

  @Inject(CacheService)
  public readonly cache!: CacheService;

  @Inject(EventService)
  public readonly event!: EventService;

  constructor(private readonly serviceName?: string) {
    this.logger = new Logger(this.constructor.name);
  }

  onModuleInit() {
    if (this.serviceName) {
      this.gRpcService = this.grpcClient.getService<S>(this.serviceName);
    }
  }

  abstract execute(command: T): Promise<R>;
}
