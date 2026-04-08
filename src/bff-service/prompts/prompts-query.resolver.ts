import { Resolver, Query, Args } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { GetPromptType } from './dto/get-prompt.type';
import { GetAllPromptsType } from './dto/get-all-prompts.type';
import { PromptResponseType, PromptsListType } from './dto/response.type';
import { GetPromptQuery } from './queries/impl/get-prompt.query';
import { GetAllPromptsQuery } from './queries/impl/get-all-prompts.query';

@Resolver('Prompt')
export class PromptsQueryResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query(() => PromptResponseType)
  async prompt(@Args('input') input: GetPromptType): Promise<PromptResponseType> {
    return this.queryBus.execute<GetPromptQuery, PromptResponseType>(new GetPromptQuery(input.userType));
  }

  @Query(() => PromptsListType)
  async prompts(@Args('input', { nullable: true }) input?: GetAllPromptsType): Promise<PromptsListType> {
    return this.queryBus.execute<GetAllPromptsQuery, PromptsListType>(
      new GetAllPromptsQuery(input?.page ?? 1, input?.limit ?? 10, input?.userType),
    );
  }
}
