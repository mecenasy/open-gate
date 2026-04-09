import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class RemoveCommandType {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id!: string;
}
