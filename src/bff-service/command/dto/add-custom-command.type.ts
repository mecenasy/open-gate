import { Field, InputType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class AddCustomCommandInput {
  @Field()
  tenantId!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  actions?: Record<string, boolean>;

  @Field(() => GraphQLJSON, { nullable: true })
  parameters?: Record<string, boolean>;
}
