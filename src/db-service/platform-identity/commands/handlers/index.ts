import { UpsertPlatformIdentityHandler } from './upsert-platform-identity.handler';
import { UpdateLastSeenHandler } from './update-last-seen.handler';
import { TransferIdentityHandler } from './transfer-identity.handler';

export const platformIdentityCommandHandlers = [
  UpsertPlatformIdentityHandler,
  UpdateLastSeenHandler,
  TransferIdentityHandler,
];
