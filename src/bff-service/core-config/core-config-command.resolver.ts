import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateConfigType } from './dto/update-config.type';
import { ConfigResponseType } from './dto/response.type';
import { UpdateConfigCommand } from './commands/impl/update-config.command';

@Resolver()
export class CoreConfigCommandResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @Mutation(() => ConfigResponseType)
  async updateConfig(@Args('input') input: UpdateConfigType): Promise<ConfigResponseType> {
    return this.commandBus.execute<UpdateConfigCommand, ConfigResponseType>(new UpdateConfigCommand(input));
  }
}
