import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CommandBus } from '@nestjs/cqrs';
import { AddConfigType } from './dto/add-config.type';
import { RemoveConfigType } from './dto/remove-config.type';
import { ConfigResponseType, ConfigSuccessType } from './dto/response.type';
import { AddConfigCommand } from './commands/impl/add-config.command';
import { RemoveConfigCommand } from './commands/impl/remove-config.command';

@Resolver()
export class ConfigCommandResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @Mutation(() => ConfigResponseType)
  async addConfig(@Args('input') input: AddConfigType): Promise<ConfigResponseType> {
    return this.commandBus.execute<AddConfigCommand, ConfigResponseType>(new AddConfigCommand(input));
  }

  @Mutation(() => ConfigSuccessType)
  async removeConfig(@Args('input') input: RemoveConfigType): Promise<ConfigSuccessType> {
    return this.commandBus.execute<RemoveConfigCommand, ConfigSuccessType>(new RemoveConfigCommand(input.key));
  }
}
