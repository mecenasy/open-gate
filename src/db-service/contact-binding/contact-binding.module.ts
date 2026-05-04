import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactBinding, PlatformIdentity } from '@app/entities';
import { ContactBindingController } from './contact-binding.controller';
import { contactBindingCommandHandlers } from './commands/handlers';
import { contactBindingQueryHandlers } from './queries/handlers';

// VerifyBinding upserts into platform_identities in the same transaction,
// so the entity is registered here too even though the dedicated CRUD lives
// in PlatformIdentityDbModule.
@Module({
  imports: [TypeOrmModule.forFeature([ContactBinding, PlatformIdentity]), CqrsModule],
  controllers: [ContactBindingController],
  providers: [...contactBindingCommandHandlers, ...contactBindingQueryHandlers],
})
export class ContactBindingDbModule {}
