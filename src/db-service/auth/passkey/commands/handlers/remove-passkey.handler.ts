import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { RemovePasskeyCommand } from '../impl/remove-passkey.command';
import { PasskeyService } from '../../passkey.service';
import { PasskeyResponse } from 'src/proto/passkey';

@CommandHandler(RemovePasskeyCommand)
export class RemovePasskeyHandler implements ICommandHandler<RemovePasskeyCommand, PasskeyResponse> {
  constructor(
    private readonly passkeyService: PasskeyService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(RemovePasskeyHandler.name);
  }

  execute(command: RemovePasskeyCommand): Promise<PasskeyResponse> {
    this.logger.log('Executing RemovePasskey');

    try {
      return this.passkeyService.removePasskey(command.request);
    } catch (error) {
      this.logger.error('Error executing RemovePasskey', error);
      throw error;
    }
  }
}
