import { Query } from '@nestjs/cqrs';

export class CheckExistQuery extends Query<boolean> {
  constructor(public readonly email: string) {
    super();
  }
}
