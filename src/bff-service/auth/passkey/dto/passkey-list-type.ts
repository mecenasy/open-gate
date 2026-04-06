import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PassKeyType {
  @Field()
  id!: string;
  @Field()
  createAt!: string;
  @Field()
  deviceName!: string;
  @Field()
  credentialID!: string;
}
