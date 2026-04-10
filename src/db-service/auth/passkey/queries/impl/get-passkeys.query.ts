import { Query } from '@nestjs/cqrs';
import { GetPasskeysRequest, GetPasskeysResponse } from 'src/proto/passkey';

export class GetPasskeysQuery extends Query<GetPasskeysResponse> {
  constructor(public readonly request: GetPasskeysRequest) {
    super();
  }
}
