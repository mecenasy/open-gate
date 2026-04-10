import { Query } from '@nestjs/cqrs';
import { Verify2FAResponse } from 'src/proto/login';

export class GetUser2FaSecretQuery extends Query<Verify2FAResponse> {
  constructor(public readonly login: string) {
    super();
  }
}
