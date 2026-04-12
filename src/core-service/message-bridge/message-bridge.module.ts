import { Module } from '@nestjs/common';
import { MessageBridgeController } from './message-bridge.controller';

@Module({ controllers: [MessageBridgeController] })
export class MessageBridgeModule {}
