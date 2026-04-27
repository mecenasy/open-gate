import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { NotifyGrpcKey, type ClientGrpc } from '@app/notify-grpc';
import {
  OnboardingStepResponse,
  PLATFORM_ONBOARDING_SERVICE_NAME,
  type PlatformOnboardingServiceClient,
} from 'src/proto/onboarding';
import { TenantAdminService } from './tenant-admin.service';

/**
 * Adapter between the GraphQL resolver and notify-service's onboarding gRPC.
 *
 * Beyond proxying, this service is the place where a `done` step gets
 * persisted: when the onboarding session has a tenantId, we immediately
 * upsert the credentials so the bridge can pick them up. Wizard sessions
 * (no tenantId) rely on the frontend to carry credentialsJson into the
 * tenant-create call instead.
 */
@Injectable()
export class PlatformOnboardingService implements OnModuleInit {
  private grpc!: PlatformOnboardingServiceClient;

  constructor(
    @Inject(NotifyGrpcKey) private readonly client: ClientGrpc,
    private readonly tenantAdmin: TenantAdminService,
  ) {}

  onModuleInit(): void {
    this.grpc = this.client.getService<PlatformOnboardingServiceClient>(PLATFORM_ONBOARDING_SERVICE_NAME);
  }

  async start(input: { tenantId?: string; platform: string; paramsJson: string }): Promise<OnboardingStepResponse> {
    const res = await lastValueFrom(
      this.grpc.startOnboarding({
        tenantId: input.tenantId,
        platform: input.platform,
        paramsJson: input.paramsJson,
      }),
    );
    await this.maybePersistOnDone(input.tenantId, input.platform, res);
    return res;
  }

  async submit(input: { sessionId: string; stepKey: string; payloadJson: string }): Promise<OnboardingStepResponse> {
    const res = await lastValueFrom(
      this.grpc.submitOnboarding({
        sessionId: input.sessionId,
        stepKey: input.stepKey,
        payloadJson: input.payloadJson,
      }),
    );
    // For replace flow we don't have tenantId in the submit args — but on
    // `done` notify-service has already returned the credentials; the
    // frontend forwards both sessionId and tenantId on the start call, so
    // the persist hook there handles the case for non-wizard flows.
    return res;
  }

  async cancel(sessionId: string): Promise<{ success: boolean; message: string }> {
    const res = await lastValueFrom(this.grpc.cancelOnboarding({ sessionId }));
    return { success: res.success, message: res.message };
  }

  /**
   * If start() was called for an existing tenant and notify replied with a
   * single-shot `done` (no interactive flow), persist the credentials now.
   * This covers e.g. a future "noop" provider that just hands back the
   * config. For Signal the done step always arrives via submit(), which is
   * handled by submitWithTenant below.
   */
  private async maybePersistOnDone(
    tenantId: string | undefined,
    platform: string,
    res: OnboardingStepResponse,
  ): Promise<void> {
    if (!tenantId || res.stepType !== 'done') return;
    const credentialsJson = extractCredentialsJson(res.dataJson);
    if (!credentialsJson) return;
    await this.tenantAdmin.upsertPlatformCredentials(tenantId, platform, credentialsJson);
  }

  /**
   * Companion of `submit` for callers that know the (tenantId, platform)
   * the session is bound to (e.g. settings flow). Persists credentials when
   * the step resolves to `done`.
   */
  async submitWithTenant(input: {
    sessionId: string;
    stepKey: string;
    payloadJson: string;
    tenantId: string;
    platform: string;
  }): Promise<OnboardingStepResponse> {
    const res = await this.submit(input);
    if (res.stepType === 'done') {
      const credentialsJson = extractCredentialsJson(res.dataJson);
      if (credentialsJson) {
        await this.tenantAdmin.upsertPlatformCredentials(input.tenantId, input.platform, credentialsJson);
      }
    }
    return res;
  }
}

function extractCredentialsJson(dataJson: string): string | null {
  if (!dataJson) return null;
  try {
    const parsed = JSON.parse(dataJson) as { credentialsJson?: unknown };
    return typeof parsed.credentialsJson === 'string' ? parsed.credentialsJson : null;
  } catch {
    return null;
  }
}
