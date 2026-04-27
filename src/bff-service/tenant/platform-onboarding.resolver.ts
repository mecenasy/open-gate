import { ForbiddenException } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { TenantStaffRole } from '@app/entities';
import { CurrentUserId } from '@app/auth';
import { TenantAdminService } from './tenant-admin.service';
import { PlatformOnboardingService } from './platform-onboarding.service';
import {
  OnboardingStepType,
  StartPlatformOnboardingInput,
  SubmitPlatformOnboardingInput,
} from './dto/platform-onboarding.types';

const ALLOWED_ROLES: ReadonlySet<string> = new Set([TenantStaffRole.Owner, TenantStaffRole.Admin]);

/**
 * Generic platform onboarding mutations. The flow is platform-agnostic
 * (signal/whatsapp/...) — per-platform logic lives in notify-service's
 * OnboardingProvider. This resolver only enforces auth and proxies to gRPC.
 *
 * Auth contract:
 *  - AuthGuard is applied globally → caller is always authenticated.
 *  - Wizard flow (no tenantId): any authenticated user may start a session
 *    because the tenant doesn't exist yet. Throttled by the global rate
 *    limiter; final write happens at tenant-create time, scoped to the
 *    new tenant.
 *  - Settings flow (tenantId set): caller must be Owner or Admin of the
 *    tenant they're configuring.
 */
@Resolver()
export class PlatformOnboardingResolver {
  constructor(
    private readonly service: PlatformOnboardingService,
    private readonly tenantAdmin: TenantAdminService,
  ) {}

  @Mutation(() => OnboardingStepType)
  async startPlatformOnboarding(
    @Args('input') input: StartPlatformOnboardingInput,
    @CurrentUserId() userId: string,
  ): Promise<OnboardingStepType> {
    if (input.tenantId) {
      await this.assertCanManageTenant(userId, input.tenantId);
    }
    const res = await this.service.start(input);
    return mapResponse(res);
  }

  @Mutation(() => OnboardingStepType)
  async submitPlatformOnboarding(
    @Args('input') input: SubmitPlatformOnboardingInput,
    @CurrentUserId() userId: string,
  ): Promise<OnboardingStepType> {
    if (input.tenantId) {
      await this.assertCanManageTenant(userId, input.tenantId);
      if (!input.platform) {
        throw new ForbiddenException('platform is required when tenantId is provided.');
      }
      const res = await this.service.submitWithTenant({
        sessionId: input.sessionId,
        stepKey: input.stepKey,
        payloadJson: input.payloadJson,
        tenantId: input.tenantId,
        platform: input.platform,
      });
      return mapResponse(res);
    }
    const res = await this.service.submit({
      sessionId: input.sessionId,
      stepKey: input.stepKey,
      payloadJson: input.payloadJson,
    });
    return mapResponse(res);
  }

  @Mutation(() => Boolean)
  async cancelPlatformOnboarding(@Args('sessionId') sessionId: string): Promise<boolean> {
    const res = await this.service.cancel(sessionId);
    return res.success;
  }

  private async assertCanManageTenant(userId: string, tenantId: string): Promise<void> {
    const { isMember, role } = await this.tenantAdmin.isTenantStaff(tenantId, userId);
    if (!isMember || !role || !ALLOWED_ROLES.has(role)) {
      throw new ForbiddenException('You are not allowed to manage platforms for this tenant.');
    }
  }
}

function mapResponse(res: {
  success: boolean;
  sessionId: string;
  stepType: string;
  stepKey: string;
  dataJson: string;
  error: string;
}): OnboardingStepType {
  return {
    success: res.success,
    sessionId: res.sessionId,
    stepType: res.stepType,
    stepKey: res.stepKey,
    dataJson: res.dataJson,
    error: res.error || undefined,
  };
}
