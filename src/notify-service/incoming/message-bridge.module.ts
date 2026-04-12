import { Module } from '@nestjs/common';
import { SignalTransformer } from './platforms/signal/signal.transformer';
import { Transform } from './platforms/transformer';
import { MessageBridgeHandler } from './handlers/message-bridge.handler';
import { Attachment } from './platforms/attachment';
import { SignalAttachment } from './platforms/signal/signal.attachment';
import { AttachmentBridgeHandler } from './handlers/attachment-bridge.handler';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';
import { SignalBridgeService } from './platforms/signal/signal-bridge.service';
// import { SignalBridgeService } from 'src/core-service/signal.controler';

@Module({
  imports: [CqrsModule, HttpModule],
  providers: [
    // MessageSaga,
    SignalTransformer,
    SignalBridgeService,
    SignalAttachment,
    MessageBridgeHandler,
    AttachmentBridgeHandler,
    {
      provide: Transform,
      useFactory(signalTransformer: SignalTransformer): Transform[] {
        return [signalTransformer];
      },
      inject: [SignalTransformer],
    },
    {
      provide: Attachment,
      useFactory(signalAttachment: SignalAttachment): Attachment[] {
        return [signalAttachment];
      },
      inject: [SignalAttachment],
    },
  ],
  exports: [SignalTransformer],
})
export class MessageBridgeModule {}
