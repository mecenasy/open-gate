import { CommandHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseCommandHandler } from '@app/cqrs';
import { UpdateConfigCommand } from '../impl/update-config.command';
import { CoreConfigService } from '../../core-config.service';
import { Config as ConfigProto } from 'src/proto/config';

@CommandHandler(UpdateConfigCommand)
export class UpdateConfigHandler extends BaseCommandHandler<UpdateConfigCommand, ConfigProto> {
  constructor(
    private readonly configService: CoreConfigService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(command: UpdateConfigCommand): Promise<ConfigProto> {
    return this.run('UpdateConfig', async () => {
      const entity = await this.configService.updateConfig(command.key, command.value);
      return this.configService.entityToProto(entity);
    });
  }
}
