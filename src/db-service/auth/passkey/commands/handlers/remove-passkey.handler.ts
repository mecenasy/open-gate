import { CommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { RemovePasskeyCommand } from '../impl/remove-passkey.command';
import { PasskeyService } from '../../passkey.service';
import { PasskeyResponse } from 'src/proto/passkey';

@CommandHandler(RemovePasskeyCommand)
export class RemovePasskeyHandler extends BaseCommandHandler<RemovePasskeyCommand, PasskeyResponse> {
  constructor(
    private readonly passkeyService: PasskeyService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: RemovePasskeyCommand): Promise<PasskeyResponse> {
    return this.run('RemovePasskey', () => this.passkeyService.removePasskey(command.request));
  }
}
