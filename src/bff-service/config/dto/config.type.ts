import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ConfigType {
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
