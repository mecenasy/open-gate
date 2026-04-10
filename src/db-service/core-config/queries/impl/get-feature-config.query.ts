import { Query } from '@nestjs/cqrs';
import { Config as ConfigProto } from 'src/proto/config';

export class GetFeatureConfigQuery extends Query<ConfigProto[]> {
  constructor(public readonly key: string) {
    super();
  }
}
