import { Query } from '@nestjs/cqrs';
import { Config as ConfigProto } from 'src/proto/config';

export class GetFeaturesQuery extends Query<ConfigProto[]> {
  constructor() {
    super();
  }
}
