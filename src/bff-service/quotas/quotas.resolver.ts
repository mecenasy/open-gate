import { UnauthorizedException } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { CurrentUserId } from '@app/auth';
import { QuotasClientService } from './quotas.client.service';
import { UsageReportType } from './dto/quotas.types';

@Resolver('Quotas')
export class QuotasResolver {
  constructor(private readonly quotas: QuotasClientService) {}

  @Query(() => UsageReportType)
  async myUsage(@CurrentUserId() userId?: string): Promise<UsageReportType> {
    if (!userId) throw new UnauthorizedException();
    return this.quotas.getUsage(userId);
  }
}
