import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { GetCommandQuery } from '../impl/get-command.query';
import { CommandService } from '../../command.service';
import { Command as CommandProto } from 'src/proto/command';

@QueryHandler(GetCommandQuery)
export class GetCommandHandler implements IQueryHandler<GetCommandQuery, CommandProto | null> {
  constructor(
    private readonly commandService: CommandService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(GetCommandHandler.name);
  }

  async execute(query: GetCommandQuery): Promise<CommandProto | null> {
    this.logger.log('Executing GetCommand');

    try {
      const entity = await this.commandService.findByIdentifier({ id: query.id, name: query.name });
      return entity ? this.commandService.entityToProto(entity) : null;
    } catch (error) {
      this.logger.error('Error executing GetCommand', error);
      throw error;
    }
  }
}
