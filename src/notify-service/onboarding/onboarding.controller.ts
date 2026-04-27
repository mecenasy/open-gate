import { Controller, Logger } from '@nestjs/common';
import {
  CancelOnboardingRequest,
  OnboardingAck,
  OnboardingStepResponse,
  PlatformOnboardingServiceController,
  PlatformOnboardingServiceControllerMethods,
  StartOnboardingRequest,
  SubmitOnboardingRequest,
} from 'src/proto/onboarding';
import { OnboardingService } from './onboarding.service';
import type { OnboardingStep } from './onboarding.types';

/**
 * Thin gRPC adapter — the actual flow lives in OnboardingService and the
 * per-platform providers. This file just translates wire format ↔ domain
 * types and turns provider exceptions into structured `error` steps so the
 * client never sees a bare gRPC failure for a recoverable mid-flow problem.
 */
@Controller()
@PlatformOnboardingServiceControllerMethods()
export class OnboardingController implements PlatformOnboardingServiceController {
  private readonly logger = new Logger(OnboardingController.name);

  constructor(private readonly onboardingService: OnboardingService) {}

  async startOnboarding(req: StartOnboardingRequest): Promise<OnboardingStepResponse> {
    try {
      const params = parseJson(req.paramsJson);
      const { session, step } = await this.onboardingService.start({
        tenantId: req.tenantId,
        platform: req.platform,
        params,
      });
      return toResponse(session.sessionId, step);
    } catch (err) {
      this.logger.error(`startOnboarding failed: ${stack(err)}`);
      return errorResponse('', err);
    }
  }

  async submitOnboarding(req: SubmitOnboardingRequest): Promise<OnboardingStepResponse> {
    try {
      const payload = parseJson(req.payloadJson);
      const { session, step } = await this.onboardingService.submit({
        sessionId: req.sessionId,
        stepKey: req.stepKey,
        payload,
      });
      return toResponse(session.sessionId, step);
    } catch (err) {
      this.logger.error(`submitOnboarding failed: ${stack(err)}`);
      return errorResponse(req.sessionId, err);
    }
  }

  async cancelOnboarding(req: CancelOnboardingRequest): Promise<OnboardingAck> {
    try {
      await this.onboardingService.cancel(req.sessionId);
      return { success: true, message: 'Cancelled' };
    } catch (err) {
      this.logger.warn(`cancelOnboarding failed: ${stack(err)}`);
      return { success: false, message: String(err) };
    }
  }
}

function toResponse(sessionId: string, step: OnboardingStep): OnboardingStepResponse {
  return {
    success: step.type !== 'error',
    sessionId,
    stepType: step.type,
    stepKey: step.key,
    dataJson: JSON.stringify(step.data),
    error: step.type === 'error' ? step.data.message : '',
  };
}

function errorResponse(sessionId: string, err: unknown): OnboardingStepResponse {
  return {
    success: false,
    sessionId,
    stepType: 'error',
    stepKey: 'error',
    dataJson: JSON.stringify({ code: 'INTERNAL', message: String(err), retriable: false }),
    error: String(err),
  };
}

function parseJson(raw: string): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}

function stack(err: unknown): string {
  return err instanceof Error ? (err.stack ?? err.message) : String(err);
}
