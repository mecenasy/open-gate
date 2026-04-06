import { Query } from '@nestjs/cqrs';

export class GetUserQuery extends Query<any> {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly phone: string,
  ) {
    super();
  }
}
