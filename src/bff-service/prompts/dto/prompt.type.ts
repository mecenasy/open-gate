import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserType } from './enums';

@ObjectType()
export class PromptType {
  @Field(() => ID)
  id!: string;

  @Field()
  key!: string;

  @Field()
  description!: string;

  @Field()
  commandName!: string;

  @Field(() => UserType)
  userType!: UserType;

  @Field()
  prompt!: string;
}

@ObjectType()
export class PromptSimplyType {
  @Field(() => ID)
  id!: string;

  @Field()
  key!: string;

  @Field()
  description!: string;

  @Field()
  commandName!: string;

  @Field(() => UserType)
  userType!: UserType;
}
