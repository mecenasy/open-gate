import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { ContactBinding, ContactBindingStatus } from '@app/entities';
import { FindBindingByOutboundMessageIdQuery } from '../impl/find-binding-by-outbound-message-id.query';

@QueryHandler(FindBindingByOutboundMessageIdQuery)
export class FindBindingByOutboundMessageIdHandler extends BaseQueryHandler<
  FindBindingByOutboundMessageIdQuery,
  ContactBinding | null
> {
  constructor(
    @InjectRepository(ContactBinding)
    private readonly repo: Repository<ContactBinding>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: FindBindingByOutboundMessageIdQuery): Promise<ContactBinding | null> {
    return this.run('FindBindingByOutboundMessageId', () =>
      // Detector lookups want only live pending rows — quotes referencing
      // already-verified or expired bindings are noise.
      this.repo.findOne({
        where: {
          outboundMessageId: query.outboundMessageId,
          status: ContactBindingStatus.Pending,
          expiresAt: MoreThan(new Date()),
        },
      }),
    );
  }
}
