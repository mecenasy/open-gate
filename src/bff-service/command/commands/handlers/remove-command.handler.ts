import { CommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { COMMAND_SERVICE_NAME, CommandServiceClient } from 'src/proto/command';
import { Handler } from 'src/bff-service/common/handler/handler';
import { CommandResponseType } from '../../dto/response.type';
import { RemoveCommandCommand } from '../impl/remove-command.command';

@CommandHandler(RemoveCommandCommand)
export class RemoveCommandHandler extends Handler<RemoveCommandCommand, CommandResponseType, CommandServiceClient> {
  constructor() {
    super(COMMAND_SERVICE_NAME);
  }

  async execute({ id }: RemoveCommandCommand): Promise<CommandResponseType> {
    const response = await lastValueFrom(this.gRpcService.removeCommand({ id }));

    if (!response || response.status === false) {
      throw new BadRequestException(response?.message ?? "Sorry we can't add this command");
    }

    return {
      status: response.status,
      message: response.message,
    };
  }
}
