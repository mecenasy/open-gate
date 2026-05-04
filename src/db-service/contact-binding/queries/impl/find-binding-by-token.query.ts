import { Query } from '@nestjs/cqrs';
import { type ContactBinding } from '@app/entities';

export class FindBindingByTokenQuery extends Query<ContactBinding | null> {
  constructor(
    public readonly token: string,
    public readonly onlyActive: boolean,
  ) {
    super();
  }
}
