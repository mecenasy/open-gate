import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class TenantAuditLogEntryType {
  @Field()
  id!: string;

  @Field({ nullable: true })
  tenantId?: string;

  @Field()
  userId!: string;

  @Field()
  action!: string;

  @Field(() => GraphQLJSON, { nullable: true })
  payload?: Record<string, unknown> | null;

  @Field({ nullable: true })
  correlationId?: string;

  @Field()
  createdAt!: string;
}
