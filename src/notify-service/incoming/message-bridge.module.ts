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
import { TwilioTransformer } from './platforms/twilio/twilio.transformer';
import { TwilioSignatureGuard } from './platforms/twilio/twilio-signature.guard';
import { TwilioTenantLookupService } from './platforms/twilio/twilio-tenant-lookup.service';
import { TwilioBridgeService } from './platforms/twilio/twilio-bridge.service';
import { TwilioWebhookController } from './platforms/twilio/twilio-webhook.controller';

@Module({
  imports: [CqrsModule, HttpModule, PlatformConfigModule, SignalVerificationModule],
  controllers: [TwilioWebhookController],
  providers: [
    SignalTransformer,
    SignalBridgeManager,
    SignalAttachment,
    TwilioTransformer,
    TwilioSignatureGuard,
    TwilioTenantLookupService,
    TwilioBridgeService,
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
  ],
  exports: [SignalTransformer, SignalBridgeManager],
})
export class MessageBridgeModule {}
