import { Field, ID, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class RemovePromptType {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id!: string;
}
