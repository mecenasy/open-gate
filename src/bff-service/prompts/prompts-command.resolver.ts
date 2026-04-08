import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CommandBus } from '@nestjs/cqrs';
import { AddPromptType } from './dto/add-prompt.type';
import { UpdatePromptType } from './dto/update-prompt.type';
import { RemovePromptType } from './dto/remove-prompt.type';
import { PromptResponseType, PromptSuccessType } from './dto/response.type';
import { AddPromptCommand } from './commands/impl/add-prompt.command';
import { UpdatePromptCommand } from './commands/impl/update-prompt.command';
import { RemovePromptCommand } from './commands/impl/remove-prompt.command';

@Resolver()
export class PromptsCommandResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @Mutation(() => PromptResponseType)
  async addPrompt(@Args('input') input: AddPromptType): Promise<PromptResponseType> {
    return this.commandBus.execute<AddPromptCommand, PromptResponseType>(new AddPromptCommand(input));
  }

  @Mutation(() => PromptResponseType)
  async updatePrompt(@Args('input') input: UpdatePromptType): Promise<PromptResponseType> {
    return this.commandBus.execute<UpdatePromptCommand, PromptResponseType>(new UpdatePromptCommand(input));
  }

  @Mutation(() => PromptSuccessType)
  async removePrompt(@Args('input') input: RemovePromptType): Promise<PromptSuccessType> {
    return this.commandBus.execute<RemovePromptCommand, PromptSuccessType>(new RemovePromptCommand(input.id));
  }
}
