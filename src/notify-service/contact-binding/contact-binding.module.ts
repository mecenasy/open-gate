import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PlatformConfigModule } from '../platform-config/platform-config.module';
import { ContactBindingInviteController } from './contact-binding-invite.controller';

@Module({
  imports: [HttpModule, PlatformConfigModule],
  controllers: [ContactBindingInviteController],
})
export class ContactBindingModule {}
