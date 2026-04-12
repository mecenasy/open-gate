import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GateGrpcModule, config as gateGrpcConfig } from '@app/gate-grpc';
import { MessageBridgeModule } from './incoming/message-bridge.module';
import { OutgoingNotifyModule } from './outgoing/outgoing.-notify.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [gateGrpcConfig] }),
    MessageBridgeModule,
    OutgoingNotifyModule,
    CqrsModule,
    GateGrpcModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
