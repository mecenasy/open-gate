import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { DbGrpcKey } from '@app/db-grpc';
import { PlanLimitExceededException, type QuotaViolation, type TenantUsageEntry, type UsageReport } from '@app/quotas';
import { TENANT_SERVICE_NAME, TenantServiceClient } from 'src/proto/tenant';
import { SubscriptionClientService } from '../subscription/subscription.service';
import type { SubscriptionPlanType } from '../subscription/dto/subscription.types';

@Injectable()
export class QuotasClientService implements OnModuleInit {
  private tenantGrpc!: TenantServiceClient;

  constructor(
    @Inject(DbGrpcKey) private readonly grpcClient: ClientGrpc,
    private readonly subscriptions: SubscriptionClientService,
  ) {}

  onModuleInit() {
    this.tenantGrpc = this.grpcClient.getService<TenantServiceClient>(TENANT_SERVICE_NAME);
  }

  async getUsage(billingUserId: string): Promise<UsageReport> {
    const res = await lastValueFrom(this.tenantGrpc.getTenantUsage({ billingUserId }));
    return {
      billingUserId,
      tenants: res.tenants,
      perTenant: (res.perTenant ?? []).map((e) => ({
        tenantId: e.tenantId,
        staff: e.staff,
        platforms: e.platforms,
        contacts: e.contacts,
        customCommands: e.customCommands,
      })),
    };
  }

  async assertCanCreateTenant(billingUserId: string): Promise<void> {
    const plan = await this.requirePlan(billingUserId);
    const { tenants } = await this.getUsage(billingUserId);
    if (tenants >= plan.maxTenants) {
      throw new PlanLimitExceededException('tenants', tenants, plan.maxTenants, plan.code);
    }
  }

  async assertCanAddStaff(tenantId: string, billingUserId: string): Promise<void> {
    const plan = await this.requirePlan(billingUserId);
    const entry = await this.requireTenantUsage(billingUserId, tenantId);
    if (entry.staff >= plan.maxStaffPerTenant) {
      throw new PlanLimitExceededException('staff', entry.staff, plan.maxStaffPerTenant, plan.code, tenantId);
    }
  }

  async assertCanAddPlatform(tenantId: string, billingUserId: string): Promise<void> {
    const plan = await this.requirePlan(billingUserId);
    const entry = await this.requireTenantUsage(billingUserId, tenantId);
    if (entry.platforms >= plan.maxPlatformsPerTenant) {
      throw new PlanLimitExceededException(
        'platforms',
        entry.platforms,
        plan.maxPlatformsPerTenant,
        plan.code,
        tenantId,
      );
    }
  }

  async assertCanAddContact(tenantId: string, billingUserId: string): Promise<void> {
    const plan = await this.requirePlan(billingUserId);
    const entry = await this.requireTenantUsage(billingUserId, tenantId);
    if (entry.contacts >= plan.maxContactsPerTenant) {
      throw new PlanLimitExceededException('contacts', entry.contacts, plan.maxContactsPerTenant, plan.code, tenantId);
    }
  }

  async assertCanAddCustomCommand(tenantId: string, billingUserId: string): Promise<void> {
    const plan = await this.requirePlan(billingUserId);
    const entry = await this.requireTenantUsage(billingUserId, tenantId);
    if (entry.customCommands >= plan.maxCustomCommandsPerTenant) {
      throw new PlanLimitExceededException(
        'customCommands',
        entry.customCommands,
        plan.maxCustomCommandsPerTenant,
        plan.code,
        tenantId,
      );
    }
  }

  async listViolations(billingUserId: string, plan: SubscriptionPlanType): Promise<QuotaViolation[]> {
    const usage = await this.getUsage(billingUserId);
    const violations: QuotaViolation[] = [];

    if (usage.tenants > plan.maxTenants) {
      violations.push({ kind: 'tenants', current: usage.tenants, max: plan.maxTenants });
    }

    for (const entry of usage.perTenant) {
      if (entry.staff > plan.maxStaffPerTenant) {
        violations.push({ kind: 'staff', tenantId: entry.tenantId, current: entry.staff, max: plan.maxStaffPerTenant });
      }
      if (entry.platforms > plan.maxPlatformsPerTenant) {
        violations.push({
          kind: 'platforms',
          tenantId: entry.tenantId,
          current: entry.platforms,
          max: plan.maxPlatformsPerTenant,
        });
      }
      if (entry.contacts > plan.maxContactsPerTenant) {
        violations.push({
          kind: 'contacts',
          tenantId: entry.tenantId,
          current: entry.contacts,
          max: plan.maxContactsPerTenant,
        });
      }
      if (entry.customCommands > plan.maxCustomCommandsPerTenant) {
        violations.push({
          kind: 'customCommands',
          tenantId: entry.tenantId,
          current: entry.customCommands,
          max: plan.maxCustomCommandsPerTenant,
        });
      }
    }

    return violations;
  }

  private async requirePlan(billingUserId: string): Promise<SubscriptionPlanType> {
    const plan = await this.subscriptions.getLimitsForUser(billingUserId);
    if (!plan) {
      throw new PlanLimitExceededException('tenants', 0, 0, 'none');
    }
    return plan;
  }

  private async requireTenantUsage(billingUserId: string, tenantId: string): Promise<TenantUsageEntry> {
    const usage = await this.getUsage(billingUserId);
    const entry = usage.perTenant.find((e) => e.tenantId === tenantId);
    return (
      entry ?? {
        tenantId,
        staff: 0,
        platforms: 0,
        contacts: 0,
        customCommands: 0,
      }
    );
  }
}
