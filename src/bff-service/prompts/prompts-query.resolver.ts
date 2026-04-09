import { Resolver, Query, Args } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { GetPromptByKeyType } from './dto/get-prompt.-by-key.type';
import { GetAllPromptsType } from './dto/get-all-prompts.type';
import { PromptResponseType, PromptsListType } from './dto/response.type';
import { GetPromptByIdQuery } from './queries/impl/get-prompt.query';
import { GetPromptByKeyQuery } from './queries/impl/get-prompt-by-key.query';
import { GetAllPromptsQuery } from './queries/impl/get-all-prompts.query';
import { GetPromptByIdType } from './dto/get-prompt.-by-id.type';

@Resolver('Prompt')
export class PromptsQueryResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query(() => PromptResponseType)
  async promptById(@Args('input') input: GetPromptByIdType): Promise<PromptResponseType> {
    return this.queryBus.execute<GetPromptByIdQuery, PromptResponseType>(new GetPromptByIdQuery(input.id));
  }

  @Query(() => PromptResponseType)
  async promptByKey(@Args('input') input: GetPromptByKeyType): Promise<PromptResponseType> {
    return this.queryBus.execute<GetPromptByKeyQuery, PromptResponseType>(new GetPromptByKeyQuery(input.key));
  }

  @Query(() => PromptsListType)
  async prompts(@Args('input', { nullable: true }) input?: GetAllPromptsType): Promise<PromptsListType> {
    return this.queryBus.execute<GetAllPromptsQuery, PromptsListType>(
      new GetAllPromptsQuery(input?.page ?? 1, input?.limit ?? 10, input?.userType),
    );
  }
}
