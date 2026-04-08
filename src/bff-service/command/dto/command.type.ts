import { Field, ID, ObjectType } from '@nestjs/graphql';
import { CommandAction } from './enums';

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

  @Field(() => [CommandAction])
  actions!: CommandAction[];

  @Field()
  parameters!: string;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
