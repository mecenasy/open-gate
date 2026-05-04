import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DbGrpcModule } from '@app/db-grpc';
import { BffGrpcModule } from '@app/bff-grpc';
import { PlatformConfigModule } from '../platform-config/platform-config.module';
import { ContactBindingInviteController } from './contact-binding-invite.controller';
import { ContactBindingDbClient } from './contact-binding-db.client';
import { BffContactBindingPushClient } from './bff-binding-push.client';
import { BindingTokenDetectorService } from './binding-token-detector.service';
import { ContactBindingCleanupService } from './contact-binding-cleanup.service';

@Module({
  imports: [HttpModule, PlatformConfigModule, DbGrpcModule, BffGrpcModule],
  controllers: [ContactBindingInviteController],
  providers: [
    ContactBindingDbClient,
    BffContactBindingPushClient,
    BindingTokenDetectorService,
    ContactBindingCleanupService,
  ],
  exports: [BindingTokenDetectorService, ContactBindingDbClient],
})
export class ContactBindingModule {}
