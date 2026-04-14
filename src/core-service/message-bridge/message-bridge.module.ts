import { Module } from '@nestjs/common';
import { MessageBridgeController } from './message-bridge.controller';
import { TenantGrpcInterceptor } from '../tenant/tenant-grpc.interceptor';

@Module({
  controllers: [MessageBridgeController],
  providers: [TenantGrpcInterceptor],
})
export class MessageBridgeModule {}
