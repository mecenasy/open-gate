import { Query } from '@nestjs/cqrs';
import { GetAllResponse } from 'src/proto/config';

export class GetFeatureConfigQuery extends Query<GetAllResponse> {
  constructor(public readonly key: string) {
    super();
  }
}
