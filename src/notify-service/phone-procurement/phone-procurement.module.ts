import { Module } from '@nestjs/common';
import { PlatformConfigModule } from '../platform-config/platform-config.module';
import { PHONE_PROCUREMENT_PROVIDERS, PhoneProcurementService } from './phone-procurement.service';
import { TwilioProcurementProvider } from './providers/twilio/twilio-procurement.provider';
import { MockProcurementProvider } from './providers/mock/mock-procurement.provider';

/**
 * Provider registry — every concrete `PhoneProcurementProvider` is
 * instantiated here and appended to PHONE_PROCUREMENT_PROVIDERS. The
 * facade picks the active one at startup based on TWILIO_SANDBOX.
 * Both providers stay registered in either mode so lookup-by-key
 * (release of a number bought under the other provider) keeps working.
 */
@Module({
  imports: [PlatformConfigModule],
  providers: [
    PhoneProcurementService,
    TwilioProcurementProvider,
    MockProcurementProvider,
    {
      provide: PHONE_PROCUREMENT_PROVIDERS,
      inject: [TwilioProcurementProvider, MockProcurementProvider],
      useFactory: (twilio: TwilioProcurementProvider, mock: MockProcurementProvider) => [twilio, mock],
    },
  ],
  exports: [PhoneProcurementService],
})
export class PhoneProcurementModule {}
