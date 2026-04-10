import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { PasskeyController } from './passkey.controller';
import { PasskeyService } from './passkey.service';
import { PassKey } from './entity/passkey.entity';
import { passkeyCommandHandlers } from './commands/handlers';
import { passkeyQueryHandlers } from './queries/handlers';

@Module({
  imports: [TypeOrmModule.forFeature([PassKey]), CqrsModule],
  controllers: [PasskeyController],
  providers: [PasskeyService, ...passkeyCommandHandlers, ...passkeyQueryHandlers],
})
export class PasskeyModule {}
