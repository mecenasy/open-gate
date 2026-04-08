import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ConfigType {
  @Field(() => ID)
  id!: string;

  @Field()
  key!: string;

  @Field()
  value!: string;

  @Field()
  description!: string;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
