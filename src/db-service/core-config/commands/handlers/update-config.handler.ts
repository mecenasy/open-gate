import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { UpdateConfigCommand } from '../impl/update-config.command';
import { CoreConfigService } from '../../core-config.service';
import { Config as ConfigProto } from 'src/proto/config';

@CommandHandler(UpdateConfigCommand)
export class UpdateConfigHandler implements ICommandHandler<UpdateConfigCommand, ConfigProto> {
  constructor(
    private readonly configService: CoreConfigService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(UpdateConfigHandler.name);
  }

  async execute(command: UpdateConfigCommand): Promise<ConfigProto> {
    this.logger.log('Executing UpdateConfig');

    try {
      const entity = await this.configService.updateConfig(command.key, command.value);
      return this.configService.entityToProto(entity);
    } catch (error) {
      this.logger.error('Error executing UpdateConfig', error);
      throw error;
    }
  }
}
