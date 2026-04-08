import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PromptSimplyType, PromptType } from './prompt.type';

@ObjectType()
export class PromptResponseType {
  @Field()
  status!: boolean;

  @Field()
  message!: string;

  @Field(() => PromptType, { nullable: true })
  data?: PromptType;
}

@ObjectType()
export class PromptsListType {
  @Field()
  status!: boolean;

  @Field()
  message!: string;

  @Field(() => [PromptSimplyType])
  data!: PromptSimplyType[];

  @Field(() => Int)
  total!: number;
}

@ObjectType()
export class PromptSuccessType {
  @Field()
  success!: boolean;
}
