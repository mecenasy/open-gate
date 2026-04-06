import { Query } from '@nestjs/cqrs';
import { StatusType } from '../../dto/status.type';

export class VerifyTokenQuery extends Query<StatusType> {
  constructor(public readonly token: string) {
    super();
  }
}
