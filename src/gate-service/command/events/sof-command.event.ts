import { AggregateRoot } from '@nestjs/cqrs';
import { SofCommand } from 'src/user-service/common/types/command';
import { UserContext } from 'src/user-service/context/user-context';

export class SofCommandEvent<T> extends AggregateRoot {
  constructor(
    public readonly command: SofCommand<T>,
    public readonly context: UserContext,
  ) {
    super();
  }
}
