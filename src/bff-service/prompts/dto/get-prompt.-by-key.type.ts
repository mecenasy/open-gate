import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class GetPromptByKeyType {
  @Field()
  @IsString()
  key!: string;
}
