import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VerifyTokenType {
  @Field()
  verify!: boolean;
}
