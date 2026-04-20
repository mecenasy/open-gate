import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CommandBus } from '@nestjs/cqrs';
import { UseGuards } from '@nestjs/common';
import { AddCommandType } from './dto/add-command.type';
import { UpdateCommandType } from './dto/update-command.type';
import { ToggleActiveStatusType } from './dto/toggle-active-status.type';
import { RemoveCommandType } from './dto/remove-command.type';
import { CommandResponseType } from './dto/response.type';
import { AddCommandCommand } from './commands/impl/add-command.command';
import { UpdateCommandCommand } from './commands/impl/update-command.command';
import { ToggleActiveStatusCommand } from './commands/impl/toggle-active-status.command';
import { RemoveCommandCommand } from './commands/impl/remove-command.command';
import { PlatformAdminGuard } from '../common/guards/platform-admin.guard';

@Resolver()
export class CommandCommandResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @Mutation(() => CommandResponseType)
  @UseGuards(PlatformAdminGuard)
  async addCommand(@Args('input') input: AddCommandType): Promise<CommandResponseType> {
    return this.commandBus.execute<AddCommandCommand, CommandResponseType>(new AddCommandCommand(input));
  }

  @Mutation(() => CommandResponseType)
  @UseGuards(PlatformAdminGuard)
  async updateCommand(@Args('input') input: UpdateCommandType): Promise<CommandResponseType> {
    return this.commandBus.execute<UpdateCommandCommand, CommandResponseType>(new UpdateCommandCommand(input));
  }

  @Mutation(() => CommandResponseType)
  @UseGuards(PlatformAdminGuard)
  async toggleActiveStatus(@Args('input') input: ToggleActiveStatusType): Promise<CommandResponseType> {
    return this.commandBus.execute<ToggleActiveStatusCommand, CommandResponseType>(
      new ToggleActiveStatusCommand(input),
    );
  }

  @Mutation(() => CommandResponseType)
  @UseGuards(PlatformAdminGuard)
  async removeCommand(@Args('input') input: RemoveCommandType): Promise<CommandResponseType> {
    return this.commandBus.execute<RemoveCommandCommand, CommandResponseType>(new RemoveCommandCommand(input.id));
  }
}
