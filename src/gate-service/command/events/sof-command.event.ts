import { AggregateRoot } from '@nestjs/cqrs';
import { SofCommand } from 'src/gate-service/common/types/command';
import { UserContext } from 'src/gate-service/context/user-context';
import { Platform } from 'src/notify-service/types/platform';

export class SofCommandEvent<T> extends AggregateRoot {
  constructor(
    public readonly command: SofCommand<T>,
    public readonly context: UserContext,
    public readonly platform: Platform,
  ) {
    super();
  }
}
