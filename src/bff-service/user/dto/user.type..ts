import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

@ObjectType()
export class UserType {
  @Field(() => ID)
  id!: string;

  @Field()
  @IsEmail()
  email!: string;
}
