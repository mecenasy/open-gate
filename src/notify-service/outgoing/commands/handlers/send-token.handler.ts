import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TokenPlatform } from '../../platforms/base/token-platform';
import { SendTokenCommand } from '../impl/send-token.command';

@CommandHandler(SendTokenCommand)
export class SendTokenHandler implements ICommandHandler<SendTokenCommand> {
  constructor(
    @Inject(TokenPlatform)
    private readonly strategies: TokenPlatform[],
  ) {}

  async execute({ platforms, email, url }: SendTokenCommand): Promise<void> {
    for (const platform of platforms) {
      const strategy = this.strategies.find((s) => s.platform === platform);
      if (strategy) {
        await strategy.send(email, url);
      }
    }
  }
}
