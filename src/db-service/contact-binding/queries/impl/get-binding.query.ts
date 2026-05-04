import { Query } from '@nestjs/cqrs';
import { type ContactBinding } from '@app/entities';

export class GetBindingQuery extends Query<ContactBinding | null> {
  constructor(public readonly id: string) {
    super();
  }
}
