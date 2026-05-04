import { FindByPlatformUserIdHandler } from './find-by-platform-user-id.handler';
import { ListIdentitiesByUserHandler } from './list-identities-by-user.handler';

export const platformIdentityQueryHandlers = [FindByPlatformUserIdHandler, ListIdentitiesByUserHandler];
