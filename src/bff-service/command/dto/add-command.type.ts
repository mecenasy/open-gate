import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { CommandAction } from './enums';

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

  @Field(() => [CommandAction])
  @IsArray()
  @IsEnum(CommandAction, { each: true })
  actions!: CommandAction[];

  @Field()
  @IsString()
  @IsNotEmpty()
  parameters!: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  roleNames!: string[];
}
