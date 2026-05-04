import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { DbGrpcKey } from '@app/db-grpc';
import { NotifyGrpcKey, type ClientGrpc } from '@app/notify-grpc';
import {
  type BindingEntry,
  CONTACT_BINDING_DB_SERVICE_NAME,
  CONTACT_BINDING_NOTIFY_SERVICE_NAME,
  type ContactBindingDbServiceClient,
  type ContactBindingNotifyServiceClient,
  type SendBindingInviteResponse,
} from 'src/proto/contact-binding';
import {
  type AddUserRequest,
  type UserData,
  USER_PROXY_SERVICE_NAME,
  type UserProxyServiceClient,
} from 'src/proto/user';

/**
 * Bridges the BFF binding resolver to three gRPC surfaces:
 *   - db-service ContactBindingDbService (CRUD over contact_bindings)
 *   - db-service UserProxyService (find-or-create user by phone for the
 *     binding subject — keeps users.phone UNIQUE happy by routing
 *     duplicates back to the existing row)
 *   - notify-service ContactBindingNotifyService (sends the Signal invite)
 */
@Injectable()
export class ContactBindingClientService implements OnModuleInit {
  private bindingDb!: ContactBindingDbServiceClient;
  private bindingNotify!: ContactBindingNotifyServiceClient;
  private user!: UserProxyServiceClient;

  constructor(
    @Inject(DbGrpcKey) private readonly dbGrpc: ClientGrpc,
    @Inject(NotifyGrpcKey) private readonly notifyGrpc: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.bindingDb = this.dbGrpc.getService<ContactBindingDbServiceClient>(CONTACT_BINDING_DB_SERVICE_NAME);
    this.bindingNotify = this.notifyGrpc.getService<ContactBindingNotifyServiceClient>(
      CONTACT_BINDING_NOTIFY_SERVICE_NAME,
    );
    this.user = this.dbGrpc.getService<UserProxyServiceClient>(USER_PROXY_SERVICE_NAME);
  }

  async findOrCreateUserByPhone(phoneE164: string, opts: AddUserOpts): Promise<UserData> {
    const existing = await lastValueFrom(this.user.getUserByPhone({ phone: phoneE164 }));
    if (existing.status && existing.data) {
      return existing.data;
    }
    const req: AddUserRequest = {
      email: opts.email ?? `${phoneE164.replace(/\D/g, '')}@placeholder.opengate`,
      phone: phoneE164,
      name: opts.name ?? 'Contact',
      surname: opts.surname ?? '',
      ownerId: opts.ownerId,
    };
    const res = await lastValueFrom(this.user.addUser(req));
    if (!res.status || !res.data) {
      throw new Error(`AddUser failed: ${res.message}`);
    }
    return res.data;
  }

  async createBinding(args: {
    tenantId: string;
    userId: string;
    phoneE164: string;
    platform: string;
    source: string;
    ttlMs?: number;
  }): Promise<BindingEntry> {
    const res = await lastValueFrom(
      this.bindingDb.createBinding({
        tenantId: args.tenantId,
        userId: args.userId,
        phoneE164: args.phoneE164,
        platform: args.platform,
        source: args.source,
        ttlMs: args.ttlMs ?? 0,
      }),
    );
    if (!res.status || !res.data) {
      throw new Error(`CreateBinding failed: ${res.message}`);
    }
    return res.data;
  }

  async sendInvite(args: {
    bindingId: string;
    tenantId: string;
    phoneE164: string;
    platform: string;
    token: string;
    tenantName: string;
  }): Promise<SendBindingInviteResponse> {
    return lastValueFrom(this.bindingNotify.sendBindingInvite(args));
  }

  async updateSendStatus(
    id: string,
    sendStatus: string,
    outboundMessageId: string | null,
    sendError: string | null,
  ): Promise<BindingEntry | null> {
    const res = await lastValueFrom(
      this.bindingDb.updateBindingSendStatus({
        id,
        sendStatus,
        outboundMessageId: outboundMessageId ?? '',
        sendError: sendError ?? '',
      }),
    );
    return res.status && res.data ? res.data : null;
  }

  async getBinding(id: string): Promise<BindingEntry | null> {
    const res = await lastValueFrom(this.bindingDb.getBinding({ id }));
    return res.status && res.data ? res.data : null;
  }

  async listPending(tenantId: string): Promise<BindingEntry[]> {
    const res = await lastValueFrom(this.bindingDb.listPendingBindings({ tenantId }));
    return res.status ? (res.data ?? []) : [];
  }

  async revoke(id: string): Promise<BindingEntry | null> {
    const res = await lastValueFrom(this.bindingDb.revokeBinding({ id }));
    return res.status && res.data ? res.data : null;
  }
}

interface AddUserOpts {
  name?: string;
  surname?: string;
  email?: string;
  ownerId?: string;
}
