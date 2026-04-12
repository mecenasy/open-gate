import { Module } from '@nestjs/common';
import { MessageModule } from './message/message.module';
import { AudioModule } from './audio/audio.module';
import { CommandModule } from './command/command.module';
import { PreProcessModule } from './pre-process/pre-process.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule, MessageModule, AudioModule, CommandModule, PreProcessModule],
})
export class ProcessModule {}
