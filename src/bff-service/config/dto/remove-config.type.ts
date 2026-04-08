import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class RemoveConfigType {
  @Field()
  @IsString()
  @IsNotEmpty()
  key!: string;
}
