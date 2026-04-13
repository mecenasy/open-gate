import { QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { GetCommandQuery } from '../impl/get-command.query';
import { CommandService } from '../../command.service';
import { Command as CommandProto } from 'src/proto/command';

@QueryHandler(GetCommandQuery)
export class GetCommandHandler extends BaseQueryHandler<GetCommandQuery, CommandProto | null> {
  constructor(
    private readonly commandService: CommandService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: GetCommandQuery): Promise<CommandProto | null> {
    return this.run('GetCommand', async () => {
      const entity = await this.commandService.findByIdentifier({ id: query.id, name: query.name });
      return entity ? this.commandService.entityToProto(entity) : null;
    });
  }
}
