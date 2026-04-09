import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateConfigType {
  @Field()
  key!: string;

  @Field()
  value!: string;
}
