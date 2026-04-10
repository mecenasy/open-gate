import { Query } from '@nestjs/cqrs';
import { UserData } from 'src/proto/user';

export class GetUserQuery extends Query<UserData | null> {
  constructor(public readonly id: string) {
    super();
  }
}
