import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserIdentityType {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  phone: string;
}
