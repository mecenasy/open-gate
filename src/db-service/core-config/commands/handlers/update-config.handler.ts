import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateConfigCommand } from '../impl/update-config.command';
import { CoreConfigService } from '../../core-config.service';
import { Config as ConfigProto } from 'src/proto/config';

@CommandHandler(UpdateConfigCommand)
export class UpdateConfigHandler implements ICommandHandler<UpdateConfigCommand, ConfigProto> {
  constructor(private readonly configService: CoreConfigService) {}

  async execute(command: UpdateConfigCommand): Promise<ConfigProto> {
    const entity = await this.configService.updateConfig(command.key, command.value);
    return this.configService.entityToProto(entity);
  }
}
