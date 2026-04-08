import { Query } from '@nestjs/cqrs';
import { GetAllResponse } from 'src/proto/config';

export class GetAllConfigsQuery extends Query<GetAllResponse> {
  constructor() {
    super();
  }
}
