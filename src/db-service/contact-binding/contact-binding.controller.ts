import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  BindingEntry,
  BindingResponse,
  ContactBindingDbServiceController,
  ContactBindingDbServiceControllerMethods,
  CreateBindingRequest,
  FindBindingByOutboundMessageIdRequest,
  FindBindingByTokenRequest,
  GetBindingRequest,
  ListBindingsResponse,
  ListPendingBindingsRequest,
  MarkExpiredBindingsRequest,
  MarkExpiredResponse,
  RevokeBindingRequest,
  UpdateBindingSendStatusRequest,
  VerifyBindingRequest,
} from 'src/proto/contact-binding';
import { BindingPlatform, ContactBinding, ContactBindingSendStatus, ContactBindingSource } from '@app/entities';
import { CreateBindingCommand } from './commands/impl/create-binding.command';
import { UpdateBindingSendStatusCommand } from './commands/impl/update-binding-send-status.command';
import { VerifyBindingCommand } from './commands/impl/verify-binding.command';
import { MarkExpiredBindingsCommand } from './commands/impl/mark-expired-bindings.command';
import { RevokeBindingCommand } from './commands/impl/revoke-binding.command';
import { GetBindingQuery } from './queries/impl/get-binding.query';
import { FindBindingByTokenQuery } from './queries/impl/find-binding-by-token.query';
import { FindBindingByOutboundMessageIdQuery } from './queries/impl/find-binding-by-outbound-message-id.query';
import { ListPendingBindingsQuery } from './queries/impl/list-pending-bindings.query';

/**
 * gRPC adapter — translates wire format ↔ command/query bus calls. All
 * actual logic lives in handlers; this file is a transport shell.
 */
@Controller()
@ContactBindingDbServiceControllerMethods()
export class ContactBindingController implements ContactBindingDbServiceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async createBinding(req: CreateBindingRequest): Promise<BindingResponse> {
    const platform = parsePlatform(req.platform);
    if (!platform) return { status: false, message: `Unknown platform="${req.platform}"`, data: undefined };
    const source = parseSource(req.source);
    if (!source) return { status: false, message: `Unknown source="${req.source}"`, data: undefined };

    const row = await this.commandBus.execute<CreateBindingCommand, ContactBinding>(
      new CreateBindingCommand(req.tenantId, req.userId, req.phoneE164, platform, source, Number(req.ttlMs ?? 0)),
    );
    return { status: true, message: 'OK', data: toEntry(row) };
  }

  async updateBindingSendStatus(req: UpdateBindingSendStatusRequest): Promise<BindingResponse> {
    const sendStatus = parseSendStatus(req.sendStatus);
    if (!sendStatus) return { status: false, message: `Unknown send_status="${req.sendStatus}"`, data: undefined };

    const row = await this.commandBus.execute<UpdateBindingSendStatusCommand, ContactBinding | null>(
      new UpdateBindingSendStatusCommand(req.id, sendStatus, req.outboundMessageId || null, req.sendError || null),
    );
    if (!row) return { status: false, message: 'Binding not found', data: undefined };
    return { status: true, message: 'OK', data: toEntry(row) };
  }

  async verifyBinding(req: VerifyBindingRequest): Promise<BindingResponse> {
    const row = await this.commandBus.execute<VerifyBindingCommand, ContactBinding | null>(
      new VerifyBindingCommand(req.id, req.platformUserId, req.displayName || null),
    );
    if (!row) return { status: false, message: 'Binding not pending or expired', data: undefined };
    return { status: true, message: 'OK', data: toEntry(row) };
  }

  async getBinding(req: GetBindingRequest): Promise<BindingResponse> {
    const row = await this.queryBus.execute<GetBindingQuery, ContactBinding | null>(new GetBindingQuery(req.id));
    if (!row) return { status: false, message: 'Not found', data: undefined };
    return { status: true, message: 'OK', data: toEntry(row) };
  }

  async findBindingByToken(req: FindBindingByTokenRequest): Promise<BindingResponse> {
    const row = await this.queryBus.execute<FindBindingByTokenQuery, ContactBinding | null>(
      new FindBindingByTokenQuery(req.token, req.onlyActive),
    );
    if (!row) return { status: false, message: 'Not found', data: undefined };
    return { status: true, message: 'OK', data: toEntry(row) };
  }

  async findBindingByOutboundMessageId(req: FindBindingByOutboundMessageIdRequest): Promise<BindingResponse> {
    const row = await this.queryBus.execute<FindBindingByOutboundMessageIdQuery, ContactBinding | null>(
      new FindBindingByOutboundMessageIdQuery(req.outboundMessageId),
    );
    if (!row) return { status: false, message: 'Not found', data: undefined };
    return { status: true, message: 'OK', data: toEntry(row) };
  }

  async listPendingBindings(req: ListPendingBindingsRequest): Promise<ListBindingsResponse> {
    const rows = await this.queryBus.execute<ListPendingBindingsQuery, ContactBinding[]>(
      new ListPendingBindingsQuery(req.tenantId),
    );
    return { status: true, message: 'OK', data: rows.map(toEntry) };
  }

  async markExpiredBindings(req: MarkExpiredBindingsRequest): Promise<MarkExpiredResponse> {
    const expiredCount = await this.commandBus.execute<MarkExpiredBindingsCommand, number>(
      new MarkExpiredBindingsCommand(req.limit),
    );
    return { status: true, message: 'OK', expiredCount };
  }

  async revokeBinding(req: RevokeBindingRequest): Promise<BindingResponse> {
    const row = await this.commandBus.execute<RevokeBindingCommand, ContactBinding | null>(
      new RevokeBindingCommand(req.id),
    );
    if (!row) return { status: false, message: 'Binding not found', data: undefined };
    return { status: true, message: 'OK', data: toEntry(row) };
  }
}

function toEntry(row: ContactBinding): BindingEntry {
  return {
    id: row.id,
    tenantId: row.tenantId,
    userId: row.userId,
    phoneE164: row.phoneE164,
    token: row.token,
    platform: row.platform,
    status: row.status,
    source: row.source,
    outboundMessageId: row.outboundMessageId ?? '',
    sendStatus: row.sendStatus,
    sendError: row.sendError ?? '',
    expiresAt: row.expiresAt.toISOString(),
    verifiedAt: row.verifiedAt ? row.verifiedAt.toISOString() : '',
    identityId: row.identityId ?? '',
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function parsePlatform(value: string): BindingPlatform | null {
  if (value === BindingPlatform.Signal) return BindingPlatform.Signal;
  if (value === BindingPlatform.WhatsApp) return BindingPlatform.WhatsApp;
  if (value === BindingPlatform.Messenger) return BindingPlatform.Messenger;
  return null;
}

function parseSource(value: string): ContactBindingSource | null {
  if (value === ContactBindingSource.OperatorFrontend) return ContactBindingSource.OperatorFrontend;
  if (value === ContactBindingSource.HouseholdInvite) return ContactBindingSource.HouseholdInvite;
  return null;
}

function parseSendStatus(value: string): ContactBindingSendStatus | null {
  if (value === ContactBindingSendStatus.Pending) return ContactBindingSendStatus.Pending;
  if (value === ContactBindingSendStatus.Sent) return ContactBindingSendStatus.Sent;
  if (value === ContactBindingSendStatus.Failed) return ContactBindingSendStatus.Failed;
  if (value === ContactBindingSendStatus.NotOnPlatform) return ContactBindingSendStatus.NotOnPlatform;
  return null;
}
