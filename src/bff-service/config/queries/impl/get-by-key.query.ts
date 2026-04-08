import { Query } from '@nestjs/cqrs';
import { ConfigResponse } from 'src/proto/config';

export class GetByKeyQuery extends Query<ConfigResponse> {
  constructor(public readonly key: string) {
    super();
  }
}
