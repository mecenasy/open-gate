import { Query } from '@nestjs/cqrs';

export class HasSmsSyncLogQuery extends Query<boolean> {
  constructor(
    public readonly tenantId: string,
    public readonly syncDate: string,
  ) {
    super();
  }
}
