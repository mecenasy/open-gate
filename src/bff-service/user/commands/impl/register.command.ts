import { Command } from '@nestjs/cqrs';
import { RegisterInput } from '../../dto/register.input';

export class RegisterCommand extends Command<void> {
  constructor(public readonly input: RegisterInput) {
    super();
  }
}
