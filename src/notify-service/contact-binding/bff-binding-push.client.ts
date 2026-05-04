import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type { ClientGrpc } from '@nestjs/microservices';
import { BffGrpcKey } from '@app/bff-grpc';
import type { BffContactBindingBridgeClient, ForwardBindingVerifiedRequest } from 'src/proto/bff';

const BFF_CONTACT_BINDING_BRIDGE_SERVICE = 'BffContactBindingBridge';

/**
 * Pushes binding-verified events to bff-service over gRPC. BFF turns them
 * into socket.io emits on room `binding:{bindingId}` for the frontend
 * that initiated the invite.
 */
@Injectable()
export class BffContactBindingPushClient implements OnModuleInit {
  private readonly logger = new Logger(BffContactBindingPushClient.name);
  private client!: BffContactBindingBridgeClient;

  constructor(@Inject(BffGrpcKey) private readonly grpc: ClientGrpc) {}

  onModuleInit(): void {
    this.client = this.grpc.getService<BffContactBindingBridgeClient>(BFF_CONTACT_BINDING_BRIDGE_SERVICE);
  }

  async forwardBindingVerified(req: ForwardBindingVerifiedRequest): Promise<void> {
    try {
      await firstValueFrom(this.client.forwardBindingVerified(req));
    } catch (err) {
      // Don't break verify flow if BFF isn't reachable — frontend still
      // sees the verified status on next pendingBindings poll / page reload.
      this.logger.warn(`Failed to push binding-verified for ${req.bindingId}: ${(err as Error).message}`);
    }
  }
}
