import { Query } from '@nestjs/cqrs';
import type { TenantPhoneNumber } from '@app/entities';

export class GetTenantPhoneByTenantQuery extends Query<TenantPhoneNumber | null> {
  constructor(public readonly tenantId: string) {
    super();
  }
}
