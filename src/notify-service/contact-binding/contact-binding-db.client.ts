import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type { ClientGrpc } from '@nestjs/microservices';
import { DbGrpcKey } from '@app/db-grpc';
import {
  type BindingEntry,
  CONTACT_BINDING_DB_SERVICE_NAME,
  type ContactBindingDbServiceClient,
} from 'src/proto/contact-binding';

@Injectable()
export class ContactBindingDbClient implements OnModuleInit {
  private client!: ContactBindingDbServiceClient;

  constructor(@Inject(DbGrpcKey) private readonly grpc: ClientGrpc) {}

  onModuleInit(): void {
    this.client = this.grpc.getService<ContactBindingDbServiceClient>(CONTACT_BINDING_DB_SERVICE_NAME);
  }

  async findByOutboundMessageId(outboundMessageId: string): Promise<BindingEntry | null> {
    const res = await firstValueFrom(this.client.findBindingByOutboundMessageId({ outboundMessageId }));
    return res.status && res.data ? res.data : null;
  }

  async findByToken(token: string, onlyActive: boolean): Promise<BindingEntry | null> {
    const res = await firstValueFrom(this.client.findBindingByToken({ token, onlyActive }));
    return res.status && res.data ? res.data : null;
  }

  async verifyBinding(id: string, platformUserId: string, displayName: string | null): Promise<BindingEntry | null> {
    const res = await firstValueFrom(this.client.verifyBinding({ id, platformUserId, displayName: displayName ?? '' }));
    return res.status && res.data ? res.data : null;
  }

  async updateSendStatus(
    id: string,
    sendStatus: string,
    outboundMessageId: string | null,
    sendError: string | null,
  ): Promise<BindingEntry | null> {
    const res = await firstValueFrom(
      this.client.updateBindingSendStatus({
        id,
        sendStatus,
        outboundMessageId: outboundMessageId ?? '',
        sendError: sendError ?? '',
      }),
    );
    return res.status && res.data ? res.data : null;
  }

  async markExpiredBindings(limit: number): Promise<number> {
    const res = await firstValueFrom(this.client.markExpiredBindings({ limit }));
    return res.expiredCount;
  }
}
