import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TenantUsageEntryType {
  @Field()
  tenantId!: string;

  @Field(() => Int)
  staff!: number;

  @Field(() => Int)
  platforms!: number;

  @Field(() => Int)
  contacts!: number;

  @Field(() => Int)
  customCommands!: number;
}

@ObjectType()
export class UsageReportType {
  @Field()
  billingUserId!: string;

  @Field(() => Int)
  tenants!: number;

  @Field(() => [TenantUsageEntryType])
  perTenant!: TenantUsageEntryType[];
}
