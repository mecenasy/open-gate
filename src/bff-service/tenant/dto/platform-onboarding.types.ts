import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OnboardingStepType {
  @Field(() => ID)
  sessionId!: string;

  /** 'form' | 'qrcode' | 'captcha' | 'verification_code' | 'info' | 'choice' | 'done' | 'error' */
  @Field()
  stepType!: string;

  @Field()
  stepKey!: string;

  /** JSON-encoded step payload — frontend parses based on stepType. */
  @Field()
  dataJson!: string;

  @Field({ nullable: true })
  error?: string;

  @Field()
  success!: boolean;
}

@InputType()
export class StartPlatformOnboardingInput {
  /** Optional. Wizard creates onboarding sessions before the tenant exists; settings flows always pass it. */
  @Field({ nullable: true })
  tenantId?: string;

  /** 'signal' | 'whatsapp' | 'messenger' | … */
  @Field()
  platform!: string;

  /** Free-form JSON; per-platform shape (Signal: { apiUrl?, account, mode, intent, previousAccount? }). */
  @Field()
  paramsJson!: string;
}

@InputType()
export class SubmitPlatformOnboardingInput {
  @Field(() => ID)
  sessionId!: string;

  @Field()
  stepKey!: string;

  @Field()
  payloadJson!: string;

  /** When provided alongside platform, the BFF auto-persists credentials on `done`. Wizard flows omit both. */
  @Field({ nullable: true })
  tenantId?: string;

  @Field({ nullable: true })
  platform?: string;
}
