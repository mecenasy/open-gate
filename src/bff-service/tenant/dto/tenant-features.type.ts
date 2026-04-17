import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TenantFeaturesType {
  @Field()
  enableSignal!: boolean;

  @Field()
  enableWhatsApp!: boolean;

  @Field()
  enableMessenger!: boolean;

  @Field()
  enableGate!: boolean;

  @Field()
  enablePayment!: boolean;

  @Field()
  enableCommandScheduling!: boolean;

  @Field()
  enableAnalytics!: boolean;

  @Field()
  enableAudioRecognition!: boolean;

  @Field(() => Int)
  maxUsersPerTenant!: number;
}
