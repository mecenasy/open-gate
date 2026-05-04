import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DbGrpcModule } from '@app/db-grpc';
import { NotifyGrpcModule } from '@app/notify-grpc';
import { GetawayModule } from 'src/bff-service/common/getaway/getaway.module';
import { TenantBffModule } from '../tenant/tenant.module';
import { ContactBindingClientService } from './contact-binding.client.service';
import { ContactBindingResolver } from './contact-binding.resolver';
import { ContactBindingBridgeController } from './binding-bridge.controller';
import { ContactBindingVerifiedHandler } from './events/contact-binding-verified.handler';
import { BindingConnectFlushService } from './binding-connect-flush.service';

@Module({
  imports: [CqrsModule, DbGrpcModule, NotifyGrpcModule, GetawayModule, TenantBffModule],
  controllers: [ContactBindingBridgeController],
  providers: [
    ContactBindingClientService,
    ContactBindingResolver,
    ContactBindingVerifiedHandler,
    BindingConnectFlushService,
  ],
})
export class ContactBindingBffModule {}
