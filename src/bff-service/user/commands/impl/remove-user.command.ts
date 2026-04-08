import { Command } from '@nestjs/cqrs';
import { SuccessResponseType } from '../../dto/response.type';

export class RemoveUserCommand extends Command<SuccessResponseType> {
  constructor(public readonly id: string) {
    super();
  }
}
