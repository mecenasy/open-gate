import { Query } from '@nestjs/cqrs';
import { Config as ConfigProto } from 'src/proto/config';

export class GetCoreAllQuery extends Query<ConfigProto[]> {
  constructor() {
    super();
  }
}
