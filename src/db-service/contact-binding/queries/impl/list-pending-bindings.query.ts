import { Query } from '@nestjs/cqrs';
import { type ContactBinding } from '@app/entities';

export class ListPendingBindingsQuery extends Query<ContactBinding[]> {
  constructor(public readonly tenantId: string) {
    super();
  }
}
