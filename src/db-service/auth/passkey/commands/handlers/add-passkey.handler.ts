import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { AddPasskeyCommand } from '../impl/add-passkey.command';
import { PasskeyService } from '../../passkey.service';
import { PasskeyResponse } from 'src/proto/passkey';

@CommandHandler(AddPasskeyCommand)
export class AddPasskeyHandler implements ICommandHandler<AddPasskeyCommand, PasskeyResponse> {
  constructor(
    private readonly passkeyService: PasskeyService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(AddPasskeyHandler.name);
  }

  async execute(command: AddPasskeyCommand): Promise<PasskeyResponse> {
    this.logger.log('Executing AddPasskeyCommand');
    try {
      const result = await this.passkeyService.addPasskey(command.request);
      this.logger.log('Passkey added successfully');
      return result;
    } catch (error) {
      this.logger.error('Failed to add passkey', error);
      throw error;
    }
  }
}
