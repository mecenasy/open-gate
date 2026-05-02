import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type { ClientGrpc } from '@nestjs/microservices';
import { BffGrpcKey } from '@app/bff-grpc';
import { BffNotifyBridgeClient } from 'src/proto/bff';
import type { VerificationSource } from './signal-verification-bridge.service';

const BFF_NOTIFY_BRIDGE_SERVICE = 'BffNotifyBridge';

/**
 * Pushes a verification code to bff-service over gRPC so it can be
 * delivered to the frontend in real-time via socket.io. Failures are
 * swallowed because the Redis bridge keeps the code available for
 * pull-on-connect (auto-flush) — losing the push doesn't lose the code.
 */
@Injectable()
export class VerificationForwarderService implements OnModuleInit {
  private readonly logger = new Logger(VerificationForwarderService.name);
  private bffClient!: BffNotifyBridgeClient;

  constructor(@Inject(BffGrpcKey) private readonly grpcClient: ClientGrpc) {}

  onModuleInit(): void {
    this.bffClient = this.grpcClient.getService<BffNotifyBridgeClient>(BFF_NOTIFY_BRIDGE_SERVICE);
  }

  async forward(phoneE164: string, code: string, source: VerificationSource): Promise<void> {
    try {
      await firstValueFrom(this.bffClient.forwardVerificationCode({ phoneE164, code, source }));
      this.logger.log(`Forwarded ${source} code for ${phoneE164} to bff-service.`);
    } catch (err) {
      this.logger.error(
        `Failed to push ${source} code for ${phoneE164} to bff-service (Redis bridge still holds it for pull-on-connect): ${(err as Error).message}`,
      );
    }
  }
}
