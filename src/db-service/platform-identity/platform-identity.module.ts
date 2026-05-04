import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformIdentity } from '@app/entities';
import { PlatformIdentityController } from './platform-identity.controller';
import { platformIdentityCommandHandlers } from './commands/handlers';
import { platformIdentityQueryHandlers } from './queries/handlers';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformIdentity]), CqrsModule],
  controllers: [PlatformIdentityController],
  providers: [...platformIdentityCommandHandlers, ...platformIdentityQueryHandlers],
})
export class PlatformIdentityDbModule {}
