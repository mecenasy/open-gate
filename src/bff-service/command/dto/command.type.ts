import { Field, ID, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class CommandType {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field()
  active!: boolean;

  @Field(() => GraphQLJSON)
  actions!: Record<string, boolean>;

  @Field(() => GraphQLJSON)
  parameters!: Record<string, boolean>;

  @Field(() => [String])
  roleNames!: string[];

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
