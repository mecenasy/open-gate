import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class AddCommandType {
  @Field()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  description!: string;

  @Field(() => GraphQLJSON)
  actions!: Record<string, boolean>;

  @Field(() => GraphQLJSON)
  @IsNotEmpty()
  parameters!: Record<string, boolean>;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  roleNames!: string[];
}
