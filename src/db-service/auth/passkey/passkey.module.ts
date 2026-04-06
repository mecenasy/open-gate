import { Module } from '@nestjs/common';
import { PasskeyController } from './passkey.controller';
import { PasskeyService } from './passkey.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassKey } from './entity/passkey.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PassKey])],
  controllers: [PasskeyController],
  providers: [PasskeyService],
})
export class PasskeyModule {}
