import { Module } from '@nestjs/common';
import { SignalTransformer } from './platforms/signal/signal.transformer';
import { Transform } from './platforms/transformer';
import { MessageSaga } from './message.saga';
import { MessageBridgeHandler } from './handlers/message-bridge.handler';

@Module({
  providers: [
    MessageSaga,
    SignalTransformer,
    MessageBridgeHandler,
    {
      provide: Transform,
      useFactory(signalTransformer: SignalTransformer): Transform[] {
        return [signalTransformer];
      },
      inject: [SignalTransformer],
    },
  ],
  exports: [SignalTransformer],
})
export class MessageBridgeModule {}