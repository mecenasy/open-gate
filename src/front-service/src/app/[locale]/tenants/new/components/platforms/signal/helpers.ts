import type { OnboardingStep, OnboardingStepResponse } from './interfaces';

export function parseOnboardingStep(res: OnboardingStepResponse): OnboardingStep {
  let data: unknown = {};
  try {
    data = res.dataJson ? JSON.parse(res.dataJson) : {};
  } catch {
    data = {};
  }
  // Trust the server's stepType; cast to the matching DU branch.
  return { type: res.stepType, key: res.stepKey, data } as OnboardingStep;
}
