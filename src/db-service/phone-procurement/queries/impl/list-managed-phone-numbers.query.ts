import { Query } from '@nestjs/cqrs';
import type { TenantPhoneNumber } from '@app/entities';

export class ListManagedPhoneNumbersQuery extends Query<TenantPhoneNumber[]> {}
