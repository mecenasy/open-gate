import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BindingPlatform, PlatformIdentity } from '@app/entities';
import {
  FindByPlatformUserIdRequest,
  ListByUserRequest,
  ListPlatformIdentitiesResponse,
  MutationResponse,
  PlatformIdentityDbServiceController,
  PlatformIdentityDbServiceControllerMethods,
  PlatformIdentityEntry,
  PlatformIdentityResponse,
  ResolvePhoneRequest,
  ResolvePhoneResponse,
  TransferIdentityRequest,
  UpdateLastSeenRequest,
  UpsertPlatformIdentityRequest,
} from 'src/proto/platform-identity';
import { UpsertPlatformIdentityCommand } from './commands/impl/upsert-platform-identity.command';
import { UpdateLastSeenCommand } from './commands/impl/update-last-seen.command';
import { TransferIdentityCommand } from './commands/impl/transfer-identity.command';
import { FindByPlatformUserIdQuery } from './queries/impl/find-by-platform-user-id.query';
import { ListIdentitiesByUserQuery } from './queries/impl/list-identities-by-user.query';

/**
 * gRPC adapter — translates wire format ↔ command/query bus calls. All
 * actual logic lives in handlers; this file is a transport shell.
 */
@Controller()
@PlatformIdentityDbServiceControllerMethods()
export class PlatformIdentityController implements PlatformIdentityDbServiceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async upsertPlatformIdentity(req: UpsertPlatformIdentityRequest): Promise<PlatformIdentityResponse> {
    const platform = parsePlatform(req.platform);
    if (!platform) return { status: false, message: `Unknown platform="${req.platform}"`, data: undefined };

    const verifiedAt = parseIso(req.verifiedAt) ?? new Date();
    const row = await this.commandBus.execute<UpsertPlatformIdentityCommand, PlatformIdentity>(
      new UpsertPlatformIdentityCommand(
        req.tenantId,
        req.userId,
        platform,
        req.platformUserId,
        req.phoneE164 || null,
        req.displayName || null,
        verifiedAt,
      ),
    );
    return { status: true, message: 'OK', data: toEntry(row) };
  }

  async findByPlatformUserId(req: FindByPlatformUserIdRequest): Promise<PlatformIdentityResponse> {
    const platform = parsePlatform(req.platform);
    if (!platform) return { status: false, message: `Unknown platform="${req.platform}"`, data: undefined };

    const row = await this.queryBus.execute<FindByPlatformUserIdQuery, PlatformIdentity | null>(
      new FindByPlatformUserIdQuery(req.tenantId, platform, req.platformUserId),
    );
    if (!row) return { status: false, message: 'Not found', data: undefined };
    return { status: true, message: 'OK', data: toEntry(row) };
  }

  async resolvePhoneByPlatformUserId(req: ResolvePhoneRequest): Promise<ResolvePhoneResponse> {
    const platform = parsePlatform(req.platform);
    if (!platform) return { found: false, phoneE164: '', userId: '' };

    const row = await this.queryBus.execute<FindByPlatformUserIdQuery, PlatformIdentity | null>(
      new FindByPlatformUserIdQuery(req.tenantId, platform, req.platformUserId),
    );
    if (!row) return { found: false, phoneE164: '', userId: '' };
    return { found: true, phoneE164: row.phoneE164 ?? '', userId: row.userId };
  }

  async listByUser(req: ListByUserRequest): Promise<ListPlatformIdentitiesResponse> {
    const rows = await this.queryBus.execute<ListIdentitiesByUserQuery, PlatformIdentity[]>(
      new ListIdentitiesByUserQuery(req.userId),
    );
    return { status: true, message: 'OK', data: rows.map(toEntry) };
  }

  async updateLastSeen(req: UpdateLastSeenRequest): Promise<MutationResponse> {
    const seenAt = parseIso(req.seenAt) ?? new Date();
    await this.commandBus.execute<UpdateLastSeenCommand, void>(new UpdateLastSeenCommand(req.id, seenAt));
    return { status: true, message: 'OK' };
  }

  async transferIdentity(req: TransferIdentityRequest): Promise<PlatformIdentityResponse> {
    const row = await this.commandBus.execute<TransferIdentityCommand, PlatformIdentity | null>(
      new TransferIdentityCommand(req.id, req.newUserId, req.newPhoneE164 || null),
    );
    if (!row) return { status: false, message: 'Identity not found', data: undefined };
    return { status: true, message: 'OK', data: toEntry(row) };
  }
}

function toEntry(row: PlatformIdentity): PlatformIdentityEntry {
  return {
    id: row.id,
    tenantId: row.tenantId,
    userId: row.userId,
    platform: row.platform,
    platformUserId: row.platformUserId,
    phoneE164: row.phoneE164 ?? '',
    displayName: row.displayName ?? '',
    verifiedAt: row.verifiedAt.toISOString(),
    lastSeenAt: row.lastSeenAt ? row.lastSeenAt.toISOString() : '',
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

function parseIso(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
