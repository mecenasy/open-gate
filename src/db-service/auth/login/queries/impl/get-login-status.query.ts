import { Query } from '@nestjs/cqrs';
import { LoginStatusResponse } from 'src/proto/login';

export class GetLoginStatusQuery extends Query<LoginStatusResponse> {
  constructor(public readonly userId: string) {
    super();
  }
}
