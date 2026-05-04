import { Module } from '@nestjs/common';
import { SignalTransformer } from './platforms/signal/signal.transformer';
import { Transform } from './platforms/transformer';
import { MessageBridgeHandler } from './handlers/message-bridge.handler';
import { Attachment } from './platforms/attachment';
import { SignalAttachment } from './platforms/signal/signal.attachment';
import { AttachmentBridgeHandler } from './handlers/attachment-bridge.handler';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';
import { SignalBridgeManager } from './platforms/signal/signal-bridge.manager';
import { PlatformConfigModule } from '../platform-config/platform-config.module';
import { SignalVerificationModule } from '../signal-verification/signal-verification.module';
import { PhoneProcurementModule } from '../phone-procurement/phone-procurement.module';
import { PlatformIdentityModule } from '../platform-identity/platform-identity.module';
import { TwilioTransformer } from './platforms/twilio/twilio.transformer';
import { TwilioBridgeService } from './platforms/twilio/twilio-bridge.service';
import { TwilioTenantLookupService } from './platforms/twilio/twilio-tenant-lookup.service';
import { TwilioWebhookHandler } from './platforms/twilio/twilio-webhook.handler';
import { WebhookController } from './webhook/webhook.controller';
import { WebhookHandler } from './webhook/webhook.handler';

@Module({
  imports: [
    CqrsModule,
    HttpModule,
    PlatformConfigModule,
    SignalVerificationModule,
    PhoneProcurementModule,
    PlatformIdentityModule,
  ],
  controllers: [WebhookController],
  providers: [
    SignalTransformer,
    SignalBridgeManager,
    SignalAttachment,
    TwilioTransformer,
    TwilioBridgeService,
    TwilioTenantLookupService,
    TwilioWebhookHandler,
    MessageBridgeHandler,
    AttachmentBridgeHandler,
    {
      provide: Transform,
      useFactory(signalTransformer: SignalTransformer, twilioTransformer: TwilioTransformer): Transform[] {
        return [signalTransformer, twilioTransformer];
      },
      inject: [SignalTransformer, TwilioTransformer],
    },
    {
      provide: Attachment,
      useFactory(signalAttachment: SignalAttachment): Attachment[] {
        return [signalAttachment];
      },
      inject: [SignalAttachment],
    },
    {
      provide: WebhookHandler,
      useFactory(twilio: TwilioWebhookHandler): WebhookHandler[] {
        return [twilio];
      },
      inject: [TwilioWebhookHandler],
    },
  ],
  exports: [SignalTransformer, SignalBridgeManager],
})
export class MessageBridgeModule {}
