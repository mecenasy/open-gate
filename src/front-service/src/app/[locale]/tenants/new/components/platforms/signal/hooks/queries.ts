import { graphql } from '@/app/gql';

export const START_PLATFORM_ONBOARDING = graphql(`
  mutation StartPlatformOnboarding($input: StartPlatformOnboardingInput!) {
    startPlatformOnboarding(input: $input) {
      sessionId
      stepType
      stepKey
      dataJson
      error
      success
    }
  }
`);

export const SUBMIT_PLATFORM_ONBOARDING = graphql(`
  mutation SubmitPlatformOnboarding($input: SubmitPlatformOnboardingInput!) {
    submitPlatformOnboarding(input: $input) {
      sessionId
      stepType
      stepKey
      dataJson
      error
      success
    }
  }
`);

export const CANCEL_PLATFORM_ONBOARDING = graphql(`
  mutation CancelPlatformOnboarding($sessionId: String!) {
    cancelPlatformOnboarding(sessionId: $sessionId)
  }
`);
