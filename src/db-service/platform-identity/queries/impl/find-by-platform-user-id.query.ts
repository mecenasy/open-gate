import { Query } from '@nestjs/cqrs';
import { type BindingPlatform, type PlatformIdentity } from '@app/entities';

export class FindByPlatformUserIdQuery extends Query<PlatformIdentity | null> {
  constructor(
    public readonly tenantId: string,
    public readonly platform: BindingPlatform,
    public readonly platformUserId: string,
  ) {
    super();
  }
}
