import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entity/tenant.entity';
import { CustomizationConfig } from './entity/customization-config.entity';
import {
  PlatformCredentials,
  TenantCommandConfig,
  TenantPromptOverride,
  TenantStaff,
  Contact,
  ContactMembership,
} from '@app/entities';
import { Prompt } from '../prompt/entity/prompt.entity';
import { TenantDbService } from './tenant.service';
import { PlatformCredentialsService } from './platform-credentials.service';
import { TenantCommandConfigService } from './tenant-command-config.service';
import { TenantPromptOverrideService } from './tenant-prompt-override.service';
import { TenantStaffService } from './tenant-staff.service';
import { ContactService } from '../contact/contact.service';
import { TenantGrpcInterceptor } from './interceptors/tenant-grpc.interceptor';
import { TenantController } from './tenant.controller';
import { TenantModule } from '@app/tenant';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tenant,
      CustomizationConfig,
      PlatformCredentials,
      TenantCommandConfig,
      TenantPromptOverride,
      TenantStaff,
      Contact,
      ContactMembership,
      Prompt,
    ]),
    TenantModule,
    DatabaseModule,
  ],
  controllers: [TenantController],
  providers: [
    TenantDbService,
    PlatformCredentialsService,
    TenantCommandConfigService,
    TenantPromptOverrideService,
    TenantStaffService,
    ContactService,
    TenantGrpcInterceptor,
    { provide: APP_INTERCEPTOR, useClass: TenantGrpcInterceptor },
  ],
  exports: [
    TypeOrmModule,
    TenantDbService,
    PlatformCredentialsService,
    TenantCommandConfigService,
    TenantPromptOverrideService,
    TenantStaffService,
    ContactService,
  ],
})
export class TenantDbModule {}
