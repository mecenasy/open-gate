import { Query } from '@nestjs/cqrs';
import { UserData } from 'src/proto/user';

export class GetUserByPhoneQuery extends Query<UserData | null> {
  constructor(public readonly phone: string) {
    super();
  }
}
