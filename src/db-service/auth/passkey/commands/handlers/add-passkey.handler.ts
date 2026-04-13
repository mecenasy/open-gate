import { CommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { AddPasskeyCommand } from '../impl/add-passkey.command';
import { PasskeyService } from '../../passkey.service';
import { PasskeyResponse } from 'src/proto/passkey';

@CommandHandler(AddPasskeyCommand)
export class AddPasskeyHandler extends BaseCommandHandler<AddPasskeyCommand, PasskeyResponse> {
  constructor(
    private readonly passkeyService: PasskeyService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: AddPasskeyCommand): Promise<PasskeyResponse> {
    return this.run('AddPasskey', async () => {
      const result = await this.passkeyService.addPasskey(command.request);
      this.logger.log('Passkey added successfully');
      return result;
    });
  }
}
