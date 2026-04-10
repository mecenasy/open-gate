import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { SignalMessageEvent } from './signal-message.event';
import { INCOMING_SIGNAL_SERVICE_NAME, IncomingSignalServiceClient } from 'src/proto/signal';
import { GateGrpcKey } from '@app/gate-grpc';

@EventsHandler(SignalMessageEvent)
export class SignalMessageHandler implements IEventHandler<SignalMessageEvent>, OnModuleInit {
  private readonly logger = new Logger(SignalMessageHandler.name);
  private gateClient!: IncomingSignalServiceClient;

  constructor(@Inject(GateGrpcKey) private readonly grpcClient: ClientGrpc) {}

  onModuleInit() {
    this.gateClient = this.grpcClient.getService<IncomingSignalServiceClient>(INCOMING_SIGNAL_SERVICE_NAME);
  }

  async handle(event: SignalMessageEvent): Promise<void> {
    try {
      const payload = JSON.stringify(event.message);
      await firstValueFrom(this.gateClient.receiveMessage({ payload }));
      this.logger.log(`✅ Signal message forwarded to gate-service`);
    } catch (error) {
      this.logger.error(`❌ Failed to forward Signal message to gate-service`, error);
    }
  }
}
