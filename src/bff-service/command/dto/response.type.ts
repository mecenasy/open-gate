import { Field, Int, ObjectType } from '@nestjs/graphql';
import { CommandType } from './command.type';

@ObjectType()
export class CommandResponseType {
  @Field()
  status!: boolean;

  @Field()
  message!: string;

  @Field(() => CommandType, { nullable: true })
  data?: CommandType;
}

@ObjectType()
export class CommandsListType {
  @Field()
  status!: boolean;

  @Field()
  message!: string;

  @Field(() => [CommandType])
  data!: CommandType[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  limit!: number;
}

@ObjectType()
export class CommandSuccessType {
  @Field()
  success!: boolean;
}
