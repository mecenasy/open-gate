import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class GetFeatureConfigType {
  @Field()
  key!: string;
}
