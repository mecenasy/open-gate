import { Query } from '@nestjs/cqrs';
import { type ContactBinding } from '@app/entities';

export class FindBindingByOutboundMessageIdQuery extends Query<ContactBinding | null> {
  constructor(public readonly outboundMessageId: string) {
    super();
  }
}
