import { Query } from '@nestjs/cqrs';
import { type PlatformIdentity } from '@app/entities';

export class ListIdentitiesByUserQuery extends Query<PlatformIdentity[]> {
  constructor(public readonly userId: string) {
    super();
  }
}
