import { Command } from '@nestjs/cqrs';
import { SuccessResponseType } from '../../dto/response.type';

export class ConfirmRegistrationCommand extends Command<SuccessResponseType> {
  constructor(public readonly token: string) {
    super();
  }
}
