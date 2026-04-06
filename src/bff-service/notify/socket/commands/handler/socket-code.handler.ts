import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SocketCodeCommand } from '../impl/socket-code.command';
import { Getaway } from 'src/bff-service/common/getaway/getaway.getaway';

@CommandHandler(SocketCodeCommand)
export class SocketCodeHandler implements ICommandHandler<SocketCodeCommand> {
  logger: Logger;
  constructor(private readonly gateway: Getaway) {
    this.logger = new Logger(SocketCodeHandler.name);
  }

  async execute({ code }: SocketCodeCommand) {
    try {
      this.gateway.server.to('6f7aee1a-3084-4790-abb4-95689432f0d2').emit('code', {
        code,
        type: 'SMS-CODE',
      });
    } catch (error) {
      this.logger.error(error);
    }
    return Promise.resolve();
  }
}
