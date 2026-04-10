import { Query } from '@nestjs/cqrs';
import { LoginResponse } from 'src/proto/login';

export class LoginQuery extends Query<LoginResponse> {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {
    super();
  }
}
