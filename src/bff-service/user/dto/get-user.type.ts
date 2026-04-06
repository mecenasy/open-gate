import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class GetUserType {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  id!: string;
}
