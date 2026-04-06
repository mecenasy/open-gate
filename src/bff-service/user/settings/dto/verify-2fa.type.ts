import { Field, InputType } from '@nestjs/graphql';
import { IsNumber, IsNotEmpty } from 'class-validator';

@InputType()
export class Accept2faType {
  @Field()
  @IsNumber()
  @IsNotEmpty()
  code!: number;
}
