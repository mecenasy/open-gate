import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NotifyGrpcKey } from '@app/notify-grpc';
import { GatewayClientConnectedEvent } from 'src/bff-service/common/getaway/gateway-client-connected.event';
import { OUTGOING_NOTIFY_SERVICE_NAME, OutgoingNotifyServiceClient } from 'src/proto/notify';
import { VERIFICATION_CODE_EVENT, VERIFICATION_ROOM_PREFIX } from './events/verification-code-received.handler';

/**
 * On every fresh socket connection, if the client joined a
 * `verify:<phoneE164>` room we ask notify-service whether a verification
 * code is already buffered in Redis (covers the race where the SMS
 * arrived before the front opened its socket) and emit it just to that
 * socket.
 */
@Injectable()
@EventsHandler(GatewayClientConnectedEvent)
export class VerificationConnectFlushService implements IEventHandler<GatewayClientConnectedEvent>, OnModuleInit {
  private readonly logger = new Logger(VerificationConnectFlushService.name);
  private notifyClient!: OutgoingNotifyServiceClient;

  constructor(@Inject(NotifyGrpcKey) private readonly grpcClient: ClientGrpc) {}

  onModuleInit(): void {
    this.notifyClient = this.grpcClient.getService<OutgoingNotifyServiceClient>(OUTGOING_NOTIFY_SERVICE_NAME);
  }

  async handle({ client, room }: GatewayClientConnectedEvent): Promise<void> {
    if (!room.startsWith(VERIFICATION_ROOM_PREFIX)) return;
    const phoneE164 = room.slice(VERIFICATION_ROOM_PREFIX.length);
    if (!phoneE164) return;

    try {
      const recorded = await firstValueFrom(this.notifyClient.getVerificationCode({ phoneE164 }));
      if (recorded.found && recorded.code) {
        client.emit(VERIFICATION_CODE_EVENT, { code: recorded.code, source: recorded.source ?? 'unknown' });
        this.logger.log(`Flushed buffered ${recorded.source ?? 'unknown'} code to fresh socket for ${phoneE164}.`);
      }
    } catch (err) {
      this.logger.error(`Failed to flush buffered code for ${phoneE164}: ${(err as Error).message}`);
    }
  }
}
