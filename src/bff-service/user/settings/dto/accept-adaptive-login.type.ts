import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AcceptAdaptiveLoginType {
  @Field()
  active!: boolean;
}
