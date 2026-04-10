import { Query } from '@nestjs/cqrs';
import { GetPasskeyRequest, GetPasskeyResponse } from 'src/proto/passkey';

export class GetPasskeyQuery extends Query<GetPasskeyResponse> {
  constructor(public readonly request: GetPasskeyRequest) {
    super();
  }
}
