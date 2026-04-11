import { type ClientGrpc, DbGrpcKey } from '@app/db-grpc';
import { CacheService, QueueService } from '@app/redis';
import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import { MESSAGES_SERVICE_NAME, MessagesServiceClient } from 'src/proto/messages';
import { GroqService } from './services/groq.service';
import { EventService } from '@app/event';
import { lastValueFrom } from 'rxjs';

export abstract class ProcessorBase implements OnModuleInit {
  protected logger: Logger;
  private messageGrpc: MessagesServiceClient;

  @Inject(CacheService)
  protected readonly cache!: CacheService;
  @Inject(DbGrpcKey)
  protected readonly grpcClient!: ClientGrpc;
  @Inject(GroqService)
  protected readonly groqService: GroqService;
  @Inject(EventService)
  protected readonly eventService: EventService;
  @Inject(QueueService)
  protected readonly queueService: QueueService;

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  onModuleInit() {
    this.messageGrpc = this.grpcClient.getService<MessagesServiceClient>(MESSAGES_SERVICE_NAME);
  }

  protected async getMessage(key: string) {
    const message = await this.cache.getFromCache<string>({
      identifier: 'message',
      path: key,
    });

    if (message) {
      return message;
    }

    const response = await lastValueFrom(this.messageGrpc.getMessage({ key }));

    if (!response?.status || !response?.data) {
      return '';
    }

    await this.cache.saveInCache<string>({
      identifier: 'message',
      path: key,
      data: response.data.value,
      EX: 3600,
    });

    return response.data.value;
  }
}
