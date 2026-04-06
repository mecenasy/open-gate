import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RemovePasskeyType {
  @Field()
  status!: boolean;
}
