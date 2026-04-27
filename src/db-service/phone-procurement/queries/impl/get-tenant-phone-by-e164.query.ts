import { Query } from '@nestjs/cqrs';
import type { TenantPhoneNumber } from '@app/entities';

export class GetTenantPhoneByE164Query extends Query<TenantPhoneNumber | null> {
  constructor(public readonly phoneE164: string) {
    super();
  }
}
