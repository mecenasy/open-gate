import { Module } from '@nestjs/common';
import { DbGrpcModule } from '@app/db-grpc';
import { PlatformConfigModule } from '../platform-config/platform-config.module';
import { SignalVerificationModule } from '../signal-verification/signal-verification.module';
import { PHONE_PROCUREMENT_PROVIDERS, PhoneProcurementService } from './phone-procurement.service';
import { TwilioProcurementProvider } from './providers/twilio/twilio-procurement.provider';
import { MockProcurementProvider } from './providers/mock/mock-procurement.provider';
import { SmsCounterSyncService } from './sms-counter-sync.service';
import { PendingPurchaseCleanupService } from './pending-purchase-cleanup.service';
import { PhoneProcurementDbClient } from './db/phone-procurement-db.client';
import { PhoneProcurementNotifyController } from './phone-procurement.controller';

/**
 * Provider registry — every concrete `PhoneProcurementProvider` is
 * instantiated here and appended to PHONE_PROCUREMENT_PROVIDERS. The
 * facade picks the active one at startup based on TWILIO_SANDBOX.
 * Both providers stay registered in either mode so lookup-by-key
 * (release of a number bought under the other provider) keeps working.
 *
 * SmsCounterSyncService runs the daily reconciliation cron — registered
 * here so it boots with the rest of the procurement pieces; ScheduleModule
 * is enabled at the app level.
 */
@Module({
  imports: [PlatformConfigModule, DbGrpcModule, SignalVerificationModule],
  controllers: [PhoneProcurementNotifyController],
  providers: [
    PhoneProcurementService,
    PhoneProcurementDbClient,
    TwilioProcurementProvider,
    MockProcurementProvider,
    SmsCounterSyncService,
    PendingPurchaseCleanupService,
    {
      provide: PHONE_PROCUREMENT_PROVIDERS,
      inject: [TwilioProcurementProvider, MockProcurementProvider],
      useFactory: (twilio: TwilioProcurementProvider, mock: MockProcurementProvider) => [twilio, mock],
    },
  ],
  exports: [PhoneProcurementService, PhoneProcurementDbClient],
})
export class PhoneProcurementModule {}
