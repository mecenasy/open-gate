import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { ContactBinding, ContactBindingStatus } from '@app/entities';
import { ListPendingBindingsQuery } from '../impl/list-pending-bindings.query';

@QueryHandler(ListPendingBindingsQuery)
export class ListPendingBindingsHandler extends BaseQueryHandler<ListPendingBindingsQuery, ContactBinding[]> {
  constructor(
    @InjectRepository(ContactBinding)
    private readonly repo: Repository<ContactBinding>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: ListPendingBindingsQuery): Promise<ContactBinding[]> {
    return this.run('ListPendingBindings', () =>
      this.repo.find({
        where: { tenantId: query.tenantId, status: ContactBindingStatus.Pending },
        order: { createdAt: 'DESC' },
      }),
    );
  }
}
