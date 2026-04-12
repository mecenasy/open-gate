import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Platform } from '../../../types/platform';
import { SignalMessage } from './types';
import { UnifiedMessage } from 'src/notify-service/types/unified-message';
import { Attachment } from '../attachment';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { isAxiosError } from 'axios';
import { GateGrpcKey } from '@app/gate-grpc';
import type { ClientGrpc } from '@nestjs/microservices';
import { INCOMING_NOTIFY_SERVICE_NAME, IncomingNotifyServiceClient } from 'src/proto/notify';

type Message = UnifiedMessage<SignalMessage>;

@Injectable()
export class SignalAttachment extends Attachment implements OnModuleInit {
  private logger: Logger;

  // TODO move to config
  private baseUrl = process.env.SIGNAL_API_URL ?? 'http://signal_bridge:8080';
  private gateClient!: IncomingNotifyServiceClient;

  public platform = Platform.Signal;
  constructor(
    private readonly httpService: HttpService,
    @Inject(GateGrpcKey) private readonly grpcClient: ClientGrpc,
  ) {
    super();
    this.logger = new Logger(SignalAttachment.name);
  }

  onModuleInit() {
    this.gateClient = this.grpcClient.getService<IncomingNotifyServiceClient>(INCOMING_NOTIFY_SERVICE_NAME);
  }

  async download(message: Message): Promise<Buffer> {
    try {
      if (!message.media?.url) {
        throw new Error('No media url found');
      }

      const { data } = await firstValueFrom(
        this.httpService.get<Buffer>(`${this.baseUrl}/v1/attachments/${message.media?.url}`, {
          responseType: 'arraybuffer',
          timeout: 5000,
        }),
      );

      if (!data) {
        throw new Error('No data found');
      }

      this.logger.log(`✅ Attachment ${message.media?.url} downloaded`);
      return data;
    } catch (error) {
      const detail = isAxiosError(error) ? JSON.stringify(error.response?.data ?? error.message) : String(error);
      this.logger.error(`❌ Failed to download attachment ${message.media?.url}: ${detail}`);
      throw new Error(`Failed to download attachment ${message.media?.url}: ${detail}`);
    }
  }
}
